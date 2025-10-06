import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mail, UserPlus } from 'lucide-react';

interface AdminInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string) => void;
}

export function AdminInviteDialog({ open, onOpenChange, onInvite }: AdminInviteDialogProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('participant');

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInvite(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('participant');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setInviteEmail('');
    setInviteRole('participant');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Campaign</DialogTitle>
          <DialogDescription>
            Send an invitation to join this campaign as a participant or admin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@university.edu"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleInvite} className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90">
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
