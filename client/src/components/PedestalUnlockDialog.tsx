import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, QrCode, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import type { Pedestal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PedestalUnlockDialogProps {
  pedestal: Pedestal | null;
  open: boolean;
  onClose: () => void;
  onUnlocked: (pedestal: Pedestal) => void;
}

export function PedestalUnlockDialog({
  pedestal,
  open,
  onClose,
  onUnlocked,
}: PedestalUnlockDialogProps) {
  const [accessCode, setAccessCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pedestal && open) {
      generateQRCode(pedestal.accessCode);
      setAccessCode("");
    }
  }, [pedestal, open]);

  const generateQRCode = async (code: string) => {
    try {
      const url = await QRCode.toDataURL(code, {
        width: 256,
        margin: 2,
        color: {
          dark: "#1e40af",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleVerifyCode = async () => {
    if (!pedestal || !accessCode) return;

    setIsVerifying(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/pedestals/${pedestal.id}/verify-access`,
        { accessCode }
      );

      if (response.verified) {
        toast({
          title: "Access Granted",
          description: `Berth ${pedestal.berthNumber} unlocked successfully!`,
        });
        onUnlocked(response.pedestal);
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message?.includes("401")
          ? "Invalid access code. Please try again."
          : "Failed to verify access code.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && accessCode.length >= 6) {
      handleVerifyCode();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-unlock-pedestal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-unlock-title">
            <Lock className="w-5 h-5" />
            Unlock Berth {pedestal?.berthNumber}
          </DialogTitle>
          <DialogDescription>
            Scan the QR code or enter the access code to control this pedestal
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" data-testid="tab-qr-code">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="manual" data-testid="tab-manual-entry">
              <Keyboard className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {qrCodeUrl && (
                <div className="p-4 bg-white rounded-lg border-2 border-primary">
                  <img
                    src={qrCodeUrl}
                    alt="Pedestal QR Code"
                    className="w-64 h-64"
                    data-testid="img-qr-code"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Scan this QR code with your marina access app to unlock utilities
              </p>
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded">
                Code: {pedestal?.accessCode}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={8}
                  className="text-center text-lg tracking-widest font-mono"
                  data-testid="input-access-code"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Find your access code on your booking confirmation or berth assignment
                </p>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={accessCode.length < 6 || isVerifying}
                className="w-full"
                data-testid="button-verify-code"
              >
                {isVerifying ? "Verifying..." : "Unlock Pedestal"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
