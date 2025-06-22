
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeammateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTeammateAdded: (teammateName: string) => void;
  onNoTeammate: () => void;
}

const TeammateDialog = ({ isOpen, onClose, onTeammateAdded, onNoTeammate }: TeammateDialogProps) => {
  const [teammateName, setTeammateName] = useState('');
  const [step, setStep] = useState<'initial' | 'input'>('initial');

  const handleYes = () => {
    setStep('input');
  };

  const handleNo = () => {
    onNoTeammate();
    handleClose();
  };

  const handleSubmitTeammate = () => {
    if (teammateName.trim()) {
      onTeammateAdded(teammateName.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('initial');
    setTeammateName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-app-slate border border-app-white/20">
        {step === 'initial' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-app-amber">Do you have any teammates?</DialogTitle>
              <DialogDescription className="text-app-neutral">
                If you already have a teammate for this hackathon, we can connect you with them.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleYes}
                className="flex-1 bg-app-amber text-app-black hover:bg-app-amber/90"
              >
                Yes, I have a teammate
              </Button>
              <Button 
                onClick={handleNo}
                variant="outline" 
                className="flex-1 border-app-white/20 text-app-neutral hover:bg-app-white/10"
              >
                No teammates yet
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-app-amber">Enter Teammate's Name</DialogTitle>
              <DialogDescription className="text-app-neutral">
                Enter the name of your teammate. We'll send them a match request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="teammate-name" className="text-app-neutral">
                  Teammate's Name
                </Label>
                <Input
                  id="teammate-name"
                  value={teammateName}
                  onChange={(e) => setTeammateName(e.target.value)}
                  placeholder="Enter their full name"
                  className="bg-app-black border-app-white/20 text-app-neutral"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitTeammate}
                  disabled={!teammateName.trim()}
                  className="flex-1 bg-app-amber text-app-black hover:bg-app-amber/90"
                >
                  Send Match Request
                </Button>
                <Button 
                  onClick={() => setStep('initial')}
                  variant="outline"
                  className="border-app-white/20 text-app-neutral hover:bg-app-white/10"
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeammateDialog;
