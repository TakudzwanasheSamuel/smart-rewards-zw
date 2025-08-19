"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  QrCode, 
  User, 
  Gift,
  AlertCircle,
  Keyboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";
import { formatPointsAsCurrency } from "@/lib/currency";
import { parseQRData, isValidRedemptionCodeFormat } from "@/lib/redemption";
import { BrowserCodeReader } from "@zxing/browser";

interface VerificationResult {
  success: boolean;
  customer?: {
    name: string;
    email: string;
    current_points: number;
    tier: string;
  };
  offer?: {
    id: string;
    name: string;
    description?: string;
    points_required?: number;
  };
  redemption_details?: {
    code: string;
    verified_at: string;
    business_name: string;
  };
  message?: string;
}

export default function RedemptionVerificationPage() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserCodeReader | null>(null);

  useEffect(() => {
    // Initialize code reader
    codeReader.current = new BrowserCodeReader();
    
    return () => {
      // Cleanup
      if (codeReader.current) {
        try {
          // Try different cleanup methods as the API may vary
          if (typeof codeReader.current.reset === 'function') {
            codeReader.current.reset();
          } else if (typeof codeReader.current.stopContinuousDecode === 'function') {
            codeReader.current.stopContinuousDecode();
          } else if (typeof codeReader.current.destroy === 'function') {
            codeReader.current.destroy();
          }
        } catch (error) {
          console.log('QR Reader cleanup error (non-critical):', error);
        }
      }
    };
  }, []);

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      console.log('📷 Starting QR code scanning...');

      const result = await codeReader.current.decodeOnceFromVideoDevice(
        undefined, // Use default camera
        videoRef.current
      );

      console.log('📋 QR Code scanned:', result.getText());
      
      // Parse QR data
      const qrData = parseQRData(result.getText());
      
      if (qrData.isValid && qrData.redemptionCode) {
        console.log('✅ Valid redemption QR code found:', qrData.redemptionCode);
        await verifyRedemption(qrData.redemptionCode);
      } else {
        // Try treating the raw text as a redemption code
        const rawText = result.getText().trim();
        if (isValidRedemptionCodeFormat(rawText)) {
          console.log('✅ Direct redemption code found:', rawText);
          await verifyRedemption(rawText);
        } else {
          throw new Error('Invalid QR code format');
        }
      }

    } catch (error: any) {
      console.error('❌ QR scanning error:', error);
      
      let errorMessage = "Failed to scan QR code. Please try again.";
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found. Please use manual code entry.";
      } else if (error.message === 'Invalid QR code format') {
        errorMessage = "This QR code is not a valid redemption code.";
      }
      
      toast({
        title: "Scanning Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      try {
        // Try different cleanup methods as the API may vary
        if (typeof codeReader.current.reset === 'function') {
          codeReader.current.reset();
        } else if (typeof codeReader.current.stopContinuousDecode === 'function') {
          codeReader.current.stopContinuousDecode();
        } else if (typeof codeReader.current.destroy === 'function') {
          codeReader.current.destroy();
        }
      } catch (error) {
        console.log('QR Reader stop error (non-critical):', error);
      }
    }
    setIsScanning(false);
  };

  const verifyRedemption = async (redemptionCode: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      console.log('🔍 Verifying redemption code:', redemptionCode);
      const result = await adminApi.verifyRedemption(redemptionCode);
      
      console.log('✅ Verification successful:', result);
      setVerificationResult(result);
      
      toast({
        title: "Redemption Verified! ✅",
        description: `Successfully verified redemption for ${result.customer?.name || 'customer'}.`,
      });

    } catch (error: any) {
      console.error('❌ Verification failed:', error);
      
      let errorMessage = "Failed to verify redemption code.";
      if (error.message.includes('Invalid redemption code')) {
        errorMessage = "This redemption code is not valid or does not exist.";
      } else if (error.message.includes('already been used')) {
        errorMessage = "This redemption code has already been used.";
      } else if (error.message.includes('expired')) {
        errorMessage = "This redemption code has expired.";
      } else if (error.message.includes('not valid for your business')) {
        errorMessage = "This redemption code is not valid for your business.";
      }
      
      setVerificationResult({
        success: false,
        message: errorMessage
      });
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = async () => {
    if (!manualCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a redemption code.",
        variant: "destructive",
      });
      return;
    }

    await verifyRedemption(manualCode.trim());
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setManualCode("");
    stopScanning();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Verify Redemption</h1>
          <p className="text-muted-foreground">
            Scan QR codes or enter redemption codes to verify customer redemptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanning/Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Redemption Code
            </CardTitle>
            <CardDescription>
              Scan the customer's QR code or manually enter their redemption code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={scanMode === 'camera' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('camera')}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setScanMode('manual')}
                className="flex-1"
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>

            {scanMode === 'camera' ? (
              /* Camera Scanning */
              <div className="space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    style={{ display: isScanning ? 'block' : 'none' }}
                  />
                  {!isScanning && (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click "Start Scanning" to use camera
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button onClick={startScanning} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  ) : (
                    <Button onClick={stopScanning} variant="destructive" className="flex-1">
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Scanning
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Manual Code Entry */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redemption-code">Redemption Code</Label>
                  <Input
                    id="redemption-code"
                    placeholder="Enter redemption code (e.g., RDM-1234567890-ABC123)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isVerifying) {
                        handleManualVerification();
                      }
                    }}
                  />
                </div>
                
                <Button 
                  onClick={handleManualVerification}
                  disabled={isVerifying || !manualCode.trim()}
                  className="w-full"
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verification Result
            </CardTitle>
            <CardDescription>
              Results of the redemption verification will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerifying ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Verifying redemption code...</span>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : verificationResult ? (
              <div className="space-y-4">
                {/* Result Status */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  verificationResult.success 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {verificationResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {verificationResult.success ? 'Redemption Verified!' : 'Verification Failed'}
                  </span>
                </div>

                {verificationResult.success ? (
                  <>
                    {/* Customer Info */}
                    {verificationResult.customer && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer Information
                        </h4>
                        <div className="bg-muted p-3 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="font-medium">{verificationResult.customer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="text-sm">{verificationResult.customer.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tier:</span>
                            <Badge variant="secondary">{verificationResult.customer.tier}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current Points:</span>
                            <span className="font-medium">
                              {verificationResult.customer.current_points} pts 
                              <span className="text-xs text-muted-foreground ml-1">
                                ({formatPointsAsCurrency(verificationResult.customer.current_points)})
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Offer Info */}
                    {verificationResult.offer && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Redeemed Offer
                        </h4>
                        <div className="bg-muted p-3 rounded-lg space-y-2">
                          <div>
                            <div className="font-medium">{verificationResult.offer.name}</div>
                            {verificationResult.offer.description && (
                              <div className="text-sm text-muted-foreground">
                                {verificationResult.offer.description}
                              </div>
                            )}
                          </div>
                          {verificationResult.offer.points_required && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Points Used:</span>
                              <span className="font-medium text-primary">
                                {verificationResult.offer.points_required} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Redemption Details */}
                    {verificationResult.redemption_details && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">Redemption Details</h4>
                        <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Code:</span>
                            <code className="bg-white/50 px-1 rounded">
                              {verificationResult.redemption_details.code}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Verified:</span>
                            <span>{new Date(verificationResult.redemption_details.verified_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Error Message */
                  <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Verification Failed</div>
                      <div className="text-sm mt-1">
                        {verificationResult.message || 'Unknown error occurred'}
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={resetVerification} variant="outline" className="w-full">
                  Verify Another Code
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Verify</h3>
                <p className="text-muted-foreground">
                  Scan a customer's QR code or enter their redemption code to verify the redemption.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
