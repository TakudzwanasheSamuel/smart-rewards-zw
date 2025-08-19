"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mukandoApi } from '@/lib/api';
import { Plus, Users, Target, Calendar, Clock } from 'lucide-react';

interface CreateMukandoDialogProps {
  businessId: string;
  businessName: string;
}

export default function CreateMukandoDialog({ businessId, businessName }: CreateMukandoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const [formData, setFormData] = useState({
    goalName: '',
    goalPointsRequired: '',
    contributionInterval: 'monthly',
    termLength: '12'
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      if (!formData.goalName || !formData.goalPointsRequired) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const pointsRequired = parseInt(formData.goalPointsRequired);
      if (pointsRequired <= 0) {
        toast({
          title: "Error",
          description: "Goal points must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      await mukandoApi.createGroupRequest({
        businessId,
        goalName: formData.goalName,
        goalPointsRequired: pointsRequired,
        contributionInterval: formData.contributionInterval,
        termLength: parseInt(formData.termLength)
      });

      toast({
        title: "Success!",
        description: `Mukando group request for "${formData.goalName}" has been submitted to ${businessName}. You'll be notified when it's approved.`,
      });

      setOpen(false);
      setFormData({
        goalName: '',
        goalPointsRequired: '',
        contributionInterval: 'monthly',
        termLength: '12'
      });
    } catch (error) {
      console.error('Error creating Mukando group request:', error);
      toast({
        title: "Information",
        description: "Mukando groups are currently being set up. Please try again later!",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Mukando Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create Mukando Group at {businessName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-800 mb-2">💡 What is Mukando?</h4>
            <p className="text-xs text-blue-700">
              Mukando is a community savings group where members contribute points towards a shared goal. 
              Members take turns receiving payouts, and the business offers a discount on the final purchase.
            </p>
          </div>

          <div>
            <Label htmlFor="goalName" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Name *
            </Label>
            <Input
              id="goalName"
              value={formData.goalName}
              onChange={(e) => setFormData(prev => ({ ...prev, goalName: e.target.value }))}
              placeholder="e.g., Gaming Console, Vacation Package, Electronics Bundle"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              What product or service are you saving for?
            </p>
          </div>

          <div>
            <Label htmlFor="goalPoints" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Points Required *
            </Label>
            <Input
              id="goalPoints"
              type="number"
              value={formData.goalPointsRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, goalPointsRequired: e.target.value }))}
              placeholder="1000"
              min="1"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Total points needed to reach the goal (equivalent to ${(parseInt(formData.goalPointsRequired) * 0.5).toFixed(2) || '0.00'})
            </p>
          </div>

          <div>
            <Label htmlFor="interval" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Contribution Interval
            </Label>
            <Select 
              value={formData.contributionInterval} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, contributionInterval: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              How often members should contribute
            </p>
          </div>

          <div>
            <Label htmlFor="termLength" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Term Length (months)
            </Label>
            <Select 
              value={formData.termLength} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, termLength: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Duration of the savings group
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-700">
              <strong>Next Steps:</strong> After you submit this request, {businessName} will review and approve it with specific terms (max members, discount rate). You'll be automatically added as the first member once approved.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Creating..." : "Submit Request"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
