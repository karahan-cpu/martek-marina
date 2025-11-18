import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, KeyRound, X, ArrowLeft } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Pedestal } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface PedestalAccessEntryProps {
  onAccessGranted: (pedestal: Pedestal) => void;
}

export function PedestalAccessEntry({ onAccessGranted }: PedestalAccessEntryProps) {
  const [mode, setMode] = useState<"choose" | "qr" | "manual" | "select-pedestal">("choose");
  const [manualCode, setManualCode] = useState("");
  const [selectedPedestalId, setSelectedPedestalId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const { data: pedestals } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const verifyAccessMutation = useMutation({
    mutationFn: async ({ pedestalId, code }: { pedestalId: string; code: string }) => {
      return apiRequest("POST", `/api/pedestals/${pedestalId}/verify-access`, { accessCode: code });
    },
    onSuccess: (data: any) => {
      const pedestal = data.pedestal;
      toast({
        title: "Access Granted",
        description: `Successfully unlocked Berth ${pedestal.berthNumber}`,
      });
      onAccessGranted(pedestal);
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid access code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startQRScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        () => {
          // Error callback - silent
        }
      );

      setIsScanning(true);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions or use manual code entry.",
        variant: "destructive",
      });
      setMode("manual");
    }
  };

  const stopQRScanner = async () => {
    if (qrScannerRef.current && isScanning) {
      try {
        await qrScannerRef.current.stop();
        await qrScannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleQRCodeScanned = async (code: string) => {
    await stopQRScanner();
    
    // QR code should contain pedestal ID and access code in format: pedestalId:accessCode
    const parts = code.split(":");
    if (parts.length === 2) {
      const [pedestalId, accessCode] = parts;
      verifyAccessMutation.mutate({ pedestalId, code: accessCode });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not valid for pedestal access.",
        variant: "destructive",
      });
      setMode("choose");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (manualCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Access code must be 6 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPedestalId) {
      toast({
        title: "No Pedestal Selected",
        description: "Please select a pedestal first.",
        variant: "destructive",
      });
      return;
    }

    verifyAccessMutation.mutate({ pedestalId: selectedPedestalId, code: manualCode });
  };

  useEffect(() => {
    if (mode === "qr" && !isScanning) {
      startQRScanner();
    }

    return () => {
      stopQRScanner();
    };
  }, [mode]);

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-access-title">Pedestal Access</CardTitle>
            <CardDescription>
              Choose how you'd like to access your pedestal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full h-24 text-lg"
              onClick={() => setMode("qr")}
              data-testid="button-scan-qr"
            >
              <Camera className="w-8 h-8 mr-3" />
              Scan QR Code
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg"
              onClick={() => setMode("select-pedestal")}
              data-testid="button-manual-code"
            >
              <KeyRound className="w-8 h-8 mr-3" />
              Enter 6-Digit Code
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "qr") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle data-testid="text-qr-scanner-title">Scan QR Code</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  stopQRScanner();
                  setMode("choose");
                }}
                data-testid="button-close-scanner"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardDescription>
              Point your camera at the QR code on your pedestal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              id="qr-reader" 
              className="w-full rounded-lg overflow-hidden border-2 border-primary"
              data-testid="qr-scanner-view"
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                stopQRScanner();
                setMode("select-pedestal");
              }}
              data-testid="button-switch-to-manual"
            >
              Use Manual Code Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "select-pedestal") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle data-testid="text-select-pedestal-title">Select Your Pedestal</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode("choose")}
                data-testid="button-back-to-choose"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardDescription>
              Choose which pedestal you want to access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {pedestals?.map((pedestal) => (
              <Button
                key={pedestal.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setSelectedPedestalId(pedestal.id);
                  setMode("manual");
                }}
                data-testid={`button-select-pedestal-${pedestal.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="font-semibold">Berth {pedestal.berthNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {pedestal.status === "available" ? "Available" : "In Use"}
                    </p>
                  </div>
                  <Badge variant="outline">{pedestal.status}</Badge>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPedestal = pedestals?.find(p => p.id === selectedPedestalId);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle data-testid="text-manual-code-title">Enter Access Code</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMode("select-pedestal");
                setManualCode("");
              }}
              data-testid="button-back-to-select"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <CardDescription>
            Enter the 6-digit code for <strong>Berth {selectedPedestal?.berthNumber}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
                data-testid="input-access-code"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={manualCode.length !== 6 || verifyAccessMutation.isPending}
              data-testid="button-verify-code"
            >
              {verifyAccessMutation.isPending ? "Verifying..." : "Verify Access"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMode("qr")}
              data-testid="button-switch-to-qr"
            >
              Scan QR Code Instead
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
