import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

// ============= User Modal =============
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function UserModal({ isOpen, onClose, onSubmit, initialData, isLoading }: UserModalProps) {
  const [formData, setFormData] = useState(initialData || { name: '', email: '', role: 'user' });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', email: '', role: 'user' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'قم بتعديل بيانات المستخدم' : 'أدخل بيانات المستخدم الجديد'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="user-name">الاسم</Label>
            <Input
              id="user-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل الاسم"
            />
          </div>

          <div>
            <Label htmlFor="user-email">البريد الإلكتروني</Label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          <div>
            <Label htmlFor="user-role">الدور</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="admin">مسؤول</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'جاري...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Team Modal =============
interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function TeamModal({ isOpen, onClose, onSubmit, initialData, isLoading }: TeamModalProps) {
  const [formData, setFormData] = useState(initialData || { name: '', owner: '', maxPlayers: 11 });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', owner: '', maxPlayers: 11 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'تعديل فريق' : 'إضافة فريق جديد'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'قم بتعديل بيانات الفريق' : 'أدخل بيانات الفريق الجديد'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">اسم الفريق</Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم الفريق"
            />
          </div>

          <div>
            <Label htmlFor="team-owner">مالك الفريق</Label>
            <Input
              id="team-owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="أدخل اسم المالك"
            />
          </div>

          <div>
            <Label htmlFor="team-max-players">الحد الأقصى للاعبين</Label>
            <Input
              id="team-max-players"
              type="number"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
              min="1"
              max="23"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'جاري...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Player Modal =============
interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function PlayerModal({ isOpen, onClose, onSubmit, initialData, isLoading }: PlayerModalProps) {
  const [formData, setFormData] = useState(initialData || { name: '', position: 'مهاجم', team: '', points: 0 });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', position: 'مهاجم', team: '', points: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'تعديل لاعب' : 'إضافة لاعب جديد'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'قم بتعديل بيانات اللاعب' : 'أدخل بيانات اللاعب الجديد'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="player-name">اسم اللاعب</Label>
            <Input
              id="player-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم اللاعب"
            />
          </div>

          <div>
            <Label htmlFor="player-position">المركز</Label>
            <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
              <SelectTrigger id="player-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="حارس">حارس</SelectItem>
                <SelectItem value="مدافع">مدافع</SelectItem>
                <SelectItem value="وسط">وسط</SelectItem>
                <SelectItem value="مهاجم">مهاجم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="player-team">الفريق الحقيقي</Label>
            <Input
              id="player-team"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              placeholder="أدخل اسم الفريق الحقيقي"
            />
          </div>

          <div>
            <Label htmlFor="player-points">النقاط</Label>
            <Input
              id="player-points"
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              min="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'جاري...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= League Modal =============
interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function LeagueModal({ isOpen, onClose, onSubmit, initialData, isLoading }: LeagueModalProps) {
  const [formData, setFormData] = useState(initialData || { name: '', type: 'عام', description: '' });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', type: 'عام', description: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'تعديل دوري' : 'إضافة دوري جديد'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'قم بتعديل بيانات الدوري' : 'أدخل بيانات الدوري الجديد'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="league-name">اسم الدوري</Label>
            <Input
              id="league-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم الدوري"
            />
          </div>

          <div>
            <Label htmlFor="league-type">نوع الدوري</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="league-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="عام">عام</SelectItem>
                <SelectItem value="خاص">خاص</SelectItem>
                <SelectItem value="بطولة">بطولة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="league-description">الوصف</Label>
            <Textarea
              id="league-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف الدوري"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'جاري...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Delete Confirmation Dialog =============
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'جاري...' : 'حذف'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============= Manage Team Players Modal =============
interface ManageTeamPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  currentPlayers: any[];
  availablePlayers: any[];
  onAddPlayer: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  isLoading?: boolean;
}

export function ManageTeamPlayersModal({
  isOpen,
  onClose,
  teamName,
  currentPlayers,
  availablePlayers,
  onAddPlayer,
  onRemovePlayer,
  isLoading
}: ManageTeamPlayersModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('all');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدارة لاعبي {teamName}</DialogTitle>
          <DialogDescription>
            أضف أو أزل لاعبين من الفريق
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Players Section */}
          <div>
            <Label>إضافة لاعب جديد</Label>
            <div className="flex gap-2">
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">اختر لاعباً</SelectItem>
                  {availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (selectedPlayer !== 'all') {
                    onAddPlayer(parseInt(selectedPlayer));
                    setSelectedPlayer('all');
                  }
                }}
                disabled={selectedPlayer === 'all' || isLoading}
              >
                إضافة
              </Button>
            </div>
          </div>

          {/* Current Players List */}
          <div>
            <Label>لاعبو الفريق الحاليون ({currentPlayers.length})</Label>
            <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
              {currentPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا يوجد لاعبون</p>
              ) : (
                currentPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-muted p-2 rounded">
                    <div>
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePlayer(player.id)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
