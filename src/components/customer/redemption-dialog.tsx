"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle, QrCode, Gift, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customerApi } from "@/lib/api";
import { formatPointsAsCurrency, getPointsDisplayText } from "@/lib/currency";
import { generateQRData, formatRedemptionCode } from "@/lib/redemption";
import QRCode from "qrcode";

interface Offer {
  id: string;
  offer_name: string;
  description?: string;
  points_required?: number;
  reward_type: string;
  is_coupon: boolean;
  discount_code?: string;
  business_id: string;
}

interface Business {
  user_id: string;
  business_name: string;
  business_category?: string;
}

interface RedemptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  business: Business | null;
  onRedemptionSuccess?: () => void;
}

export function RedemptionDialog({ 
  isOpen, 
  onClose, 
  offer, 
  business,
  onRedemptionSuccess 
}: RedemptionDialogProps) {
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRedemptionResult(null);
      setQrCodeUrl("");
      setIsCopied(false);
    }
  }, [isOpen]);

  // Generate QR code when redemption is successful
  useEffect(() => {
    if (redemptionResult?.redemption_code) {
      const qrData = generateQRData(
        redemptionResult.redemption_code,
        offer?.id || "",
        business?.user_id || ""
      );
      
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR Code generation error:', err));
    }
  }, [redemptionResult, offer, business]);

  const handleRedeem = async () => {
    if (!offer) return;

    setIsRedeeming(true);
    try {
      console.log('🎯 Redeeming offer:', offer.id);
      const result = await customerApi.redeemOffer(offer.id);
      
      console.log('✅ Redemption successful:', result);
      setRedemptionResult(result);
      
      // Notify parent component
      if (onRedemptionSuccess) {
        onRedemptionSuccess();
      }

      toast({
        title: "Offer Redeemed Successfully! 🎉",
        description: `You've redeemed "${offer.offer_name}" for ${offer.points_required} points. Show the QR code to the business to complete the redemption.`,
      });

    } catch (error: any) {
      console.error('❌ Redemption failed:', error);
      
      let errorMessage = "Failed to redeem offer. Please try again.";
      if (error.message === 'Insufficient points') {
        errorMessage = `You need ${offer.points_required} points to redeem this offer. You currently have fewer points.`;
      } else if (error.message.includes('expired')) {
        errorMessage = "This offer has expired and is no longer available.";
      } else if (error.message.includes('not available')) {
        errorMessage = "This offer is currently not available for redemption.";
      }
      
      toast({
        title: "Redemption Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyCode = async () => {
    if (redemptionResult?.redemption_code) {
      try {
        await navigator.clipboard.writeText(redemptionResult.redemption_code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: "Code Copied!",
          description: "Redemption code copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy code. Please copy it manually.",
          variant: "destructive",
        });
      }
    }
  };

  if (!offer || !business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {redemptionResult ? "Redemption Successful!" : "Redeem Offer"}
          </DialogTitle>
          <DialogDescription>
            {redemptionResult 
              ? "Show this QR code or redemption code to the business to complete your redemption."
              : `Redeem "${offer.offer_name}" from ${business.business_name}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Offer Details */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold text-lg mb-2">{offer.offer_name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {offer.description || "No description available"}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{business.business_name}</Badge>
                <Badge variant="outline">{offer.reward_type}</Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {offer.points_required || 0} pts
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPointsAsCurrency(offer.points_required || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Redemption Result */}
          {redemptionResult ? (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Points deducted successfully!</span>
              </div>

              {/* Balance Update */}
              <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-800 rounded-lg">
                <span>New Points Balance:</span>
                <span className="font-bold">
                  {redemptionResult.new_balance} pts ({formatPointsAsCurrency(redemptionResult.new_balance)})
                </span>
              </div>

              {/* QR Code */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <QrCode className="h-4 w-4" />
                  Show this QR code to the business
                </div>
                
                {qrCodeUrl ? (
                  <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <img 
                      src={qrCodeUrl} 
                      alt="Redemption QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Skeleton className="w-48 h-48" />
                  </div>
                )}
              </div>

              {/* Redemption Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <span>Or share this redemption code:</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                  <code className="flex-1 text-center font-mono text-lg tracking-wider">
                    {formatRedemptionCode(redemptionResult.redemption_code)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expiry Notice */}
              <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                <Clock className="h-4 w-4" />
                <span>This redemption code expires in 24 hours</span>
              </div>
            </div>
          ) : (
            /* Confirmation UI */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                <Sparkles className="h-5 w-5" />
                <span>Ready to redeem this offer?</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• {getPointsDisplayText(offer.points_required || 0)} will be deducted from your account</p>
                <p>• You'll receive a QR code to show at the business</p>
                <p>• The redemption code expires in 24 hours</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {redemptionResult ? (
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleRedeem} 
                  disabled={isRedeeming}
                  className="flex-1"
                >
                  {isRedeeming ? "Processing..." : "Redeem Offer"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
