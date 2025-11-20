'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { refreshQueries } from '@/lib/actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { QueryTags } from '@/lib/query-tags';

export function RefreshData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshQueries().finally(() => {
      setIsRefreshing(false);
    });
    toast.success('Episodes refreshed', {
      position: 'bottom-right',
    });
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          {isRefreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh episodes</p>
      </TooltipContent>
    </Tooltip>
  );
}
