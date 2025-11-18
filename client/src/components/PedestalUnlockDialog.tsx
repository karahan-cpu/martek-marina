import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setAccessCode("");
    }
  }, [open]);

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
            Enter your access code to control water and electricity utilities
          </DialogDescription>
        </DialogHeader>

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
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
              data-testid="input-access-code"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Find your access code on your booking confirmation or berth assignment email
            </p>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={accessCode.length !== 6 || isVerifying}
            className="w-full"
            data-testid="button-verify-code"
          >
            {isVerifying ? "Verifying..." : "Unlock Pedestal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
