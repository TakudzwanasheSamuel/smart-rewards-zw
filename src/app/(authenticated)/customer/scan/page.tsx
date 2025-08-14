"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Camera, Upload, AlertTriangle } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"

export default function ScanPage() {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not supported.");
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings.",
        });
      }
    };

    getCameraPermission();

    return () => {
        // Stop camera stream when component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file and process it.
      toast({
        title: "Receipt Uploaded",
        description: `${file.name} is being processed for verification.`,
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">
        Scan & Earn
      </h1>
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="qr-code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr-code">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Code
              </TabsTrigger>
              <TabsTrigger value="upload-receipt">
                <Camera className="mr-2 h-4 w-4" />
                Upload Receipt
              </TabsTrigger>
            </TabsList>
            <TabsContent value="qr-code" className="p-6">
              <CardTitle>Scan Receipt QR Code</CardTitle>
              <CardDescription className="mb-4">
                Point your camera at the QR code on your receipt to earn points instantly.
              </CardDescription>
              <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-4 border-white/80 rounded-lg" />
                </div>
                {hasCameraPermission === false && (
                   <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4">
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use the QR scanner. You may need to change permissions in your browser settings and refresh the page.
                        </AlertDescription>
                    </Alert>
                   </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="upload-receipt" className="p-6">
              <CardTitle>Upload Receipt Photo</CardTitle>
              <CardDescription className="mb-4">
                No QR code? No problem. Upload a photo of your receipt for verification.
              </CardDescription>
              <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-sm text-muted-foreground">
                  Click the button to upload a photo of your receipt.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PNG, JPG, or GIF up to 10MB
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Upload Photo
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
