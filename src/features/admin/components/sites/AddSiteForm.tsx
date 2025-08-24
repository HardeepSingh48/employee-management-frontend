"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sitesService, CreateSiteData } from '@/lib/sites-service';

export default function AddSiteForm() {
  const { toast } = useToast();
  const [siteData, setSiteData] = useState<CreateSiteData>({
    site_name: '',
    location: '',
    state: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    setLoading(true);

    try {
      await sitesService.createSite(siteData);

      toast({
        title: 'Success',
        description: 'Site created successfully',
        variant: 'default'
      });
      // Reset form
      setSiteData({
        site_name: '',
        location: '',
        state: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to create site',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name *</Label>
            <Input
              id="site_name"
              name="site_name"
              value={siteData.site_name}
              onChange={handleChange}
              required
              placeholder="Enter site name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={siteData.location}
              onChange={handleChange}
              placeholder="Enter location"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              name="state"
              value={siteData.state}
              onChange={handleChange}
              required
              placeholder="Enter state"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Site'}
          </Button>
        </div>
      </form>
    </div>
  );
}