import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeCard } from '@/components/dashboard/NoticeCard';
import API from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Notice } from '@/types';

const emptyNotice = {
  title: '',
  content: '',
  priority: 'normal' as Notice['priority'],
};

export default function NoticesManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState(emptyNotice);
  const [editForm, setEditForm] = useState(emptyNotice);

  const fetchNotices = async () => {
    try {
      const res = await API.get('/notices');
      setNotices(res.data);
    } catch (error) {
      toast.error('Error fetching notices');
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post('/notices', newNotice);
      fetchNotices();
      setNewNotice(emptyNotice);
      setIsCreateDialogOpen(false);
      toast.success('Notice published successfully!');
    } catch (error) {
      toast.error('Error creating notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) {
      return;
    }

    try {
      await API.delete(`/notices/${id}`);
      fetchNotices();
      toast.success('Notice deleted');
    } catch (error) {
      toast.error('Error deleting notice');
    }
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setEditForm({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
    });
  };

  const handleEditNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice?._id && !editingNotice?.id) {
      return;
    }

    try {
      await API.put(`/notices/${editingNotice._id || editingNotice.id}`, editForm);
      fetchNotices();
      setEditingNotice(null);
      toast.success('Notice updated successfully');
    } catch (error) {
      toast.error('Error updating notice');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Notice Management</h1>
          <p className="page-subtitle">Create and manage hostel notices</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Post Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddNotice} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Notice title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newNotice.priority} onValueChange={(value: Notice['priority']) => setNewNotice({ ...newNotice, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Write the notice content..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Publish Notice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice._id || notice.id} className="relative group">
            <NoticeCard notice={notice} />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(notice)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(notice._id || notice.id || '')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingNotice} onOpenChange={(open) => !open && setEditingNotice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditNotice} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={editForm.priority} onValueChange={(value: Notice['priority']) => setEditForm({ ...editForm, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={6}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingNotice(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Notice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
