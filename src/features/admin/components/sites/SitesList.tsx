"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/CustomModal';
import { sitesService, Site } from '@/lib/sites-service';

interface EditSiteData {
  site_name: string;
  location: string;
  state: string;
}

export default function SitesList() {
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditSiteData>({
    site_name: '',
    location: '',
    state: ''
  });

  const fetchSites = async (page: number, search: string = '') => {
    setLoading(true);
    try {
      const response = await sitesService.getSites(page, 10, search);
      setSites(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to fetch sites',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSites(1, searchTerm);
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setEditForm({
      site_name: site.site_name,
      location: site.location || '',
      state: site.state
    });
  };

  const handleUpdate = async () => {
    if (!editingSite) return;
    
    try {
      await sitesService.updateSite(editingSite.site_id, editForm);
      
      toast({
        title: 'Success',
        description: 'Site updated successfully',
        variant: 'default'
      });
      setEditingSite(null);
      fetchSites(currentPage, searchTerm);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update site',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSiteId) return;
    
    try {
      await sitesService.deleteSite(deletingSiteId);
      
      toast({
        title: 'Success',
        description: 'Site deleted successfully',
        variant: 'default'
      });
      setDeletingSiteId(null);
      fetchSites(currentPage, searchTerm);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete site',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sites List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site ID</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <TableRow key={site.site_id}>
                      <TableCell className="font-medium">{site.site_id}</TableCell>
                      <TableCell>{site.site_name}</TableCell>
                      <TableCell>{site.location || '-'}</TableCell>
                      <TableCell>{site.state}</TableCell>
                      <TableCell>{site.created_date ? new Date(site.created_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(site)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingSiteId(site.site_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {sites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No sites found
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSite}
        onClose={() => setEditingSite(null)}
        title="Edit Site"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site ID</label>
            <Input
              value={editingSite?.site_id || ''}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <Input
              value={editForm.site_name}
              onChange={(e) => setEditForm({...editForm, site_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={editForm.location}
              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Input
              value={editForm.state}
              onChange={(e) => setEditForm({...editForm, state: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditingSite(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingSiteId}
        onClose={() => setDeletingSiteId(null)}
        title="Delete Site"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this site? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeletingSiteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}