'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { getAllStylingEnquiries } from '@/redux/slice/StylingEnquirySlice';
import { Loader2, X, CalendarIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Page = () => {
  const dispatch = useAppDispatch();

  const { loading, error, enquiries } = useAppSelector(
    (state: RootState) => state.stylingenquiry
  );

  /* ================= FILTER STATE ================= */
  const [search, setSearch] = useState('');
  const [projectType, setProjectType] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  useEffect(() => {
    dispatch(getAllStylingEnquiries());
  }, [dispatch]);

  /* ================= PROJECT TYPES ================= */
  const projectTypes = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        enquiries
          .map((e) => e.projectType)
          .filter((type): type is string => Boolean(type))
      )
    );
  }, [enquiries]);

  /* ================= FILTER LOGIC ================= */
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const enquiryDate = enquiry.createdAt
        ? new Date(enquiry.createdAt)
        : null;

      const matchesSearch =
        enquiry.fullName.toLowerCase().includes(search.toLowerCase()) ||
        enquiry.email.toLowerCase().includes(search.toLowerCase()) ||
        enquiry.phone.includes(search);

      const matchesProject =
        !projectType || enquiry.projectType === projectType;

      const matchesFromDate =
        !fromDate || (enquiryDate && enquiryDate >= fromDate);

      const matchesToDate =
        !toDate ||
        (enquiryDate &&
          enquiryDate <= new Date(toDate.setHours(23, 59, 59, 999)));

      return (
        matchesSearch &&
        matchesProject &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [enquiries, search, projectType, fromDate, toDate]);

  /* ================= CLEAR ================= */
  const clearFilters = () => {
    setSearch('');
    setProjectType('');
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold">
        Styling Enquiries
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Name / Email / Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project Type */}
        <div className="w-full md:w-1/4">
          <label className="text-sm font-medium">
            Project Type
          </label>
          <Select
            value={projectType}
            onValueChange={setProjectType}
          >
            <SelectTrigger>
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div>
          <label className="text-sm font-medium">From</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal',
                  !fromDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate
                  ? format(fromDate, 'dd MMM yyyy')
                  : 'Select'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div>
          <label className="text-sm font-medium">To</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal',
                  !toDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate
                  ? format(toDate, 'dd MMM yyyy')
                  : 'Select'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear */}
        {(search || projectType || fromDate || toDate) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-red-600"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Space</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Products</th>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredEnquiries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  No enquiries found
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <tr
                  key={enquiry._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {enquiry.fullName}
                  </td>

                  <td className="px-4 py-3">
                    <div>{enquiry.phone}</div>
                    <div className="text-xs text-gray-500">
                      {enquiry.email}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {enquiry.spaceType || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {enquiry.projectType || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {enquiry.includeProducts || '-'}
                  </td>

                  <td className="px-4 py-3 truncate max-w-xs">
                    {enquiry.message || '-'}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {enquiry.createdAt
                      ? format(
                          new Date(enquiry.createdAt),
                          'dd MMM yyyy'
                        )
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
