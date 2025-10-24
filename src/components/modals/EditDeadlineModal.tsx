import React, { useState, useEffect, useMemo } from 'react';
import { Deadline, DeadlineType, Property } from '../../types';
import { X, CalendarPlus } from 'lucide-react';
import * as dataService from '../../services/dataService';

// Helper function to generate a Google Calendar link
const generateGoogleCalendarUrl = (deadline: Deadline, propertyName: string) => {
    const title = encodeURIComponent(`${deadline.title} (${propertyName})`);
    const details = encodeURIComponent(`Scadenza per l'immobile: ${propertyName}.\nTipo: ${deadline.type}${deadline.typeOther ? ` (${deadline.typeOther})` : ''}.`);
    // Format for all-day event: YYYYMMDD / YYYYMMDD+1
    const startDate = deadline.dueDate.replace(/-/g, '');
    const endDate = new Date(deadline.dueDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDateStr}&details=${details}`;
};

// Helper function to generate and download an .ics file
const handleIcsDownload = (deadline: Deadline, propertyName: string) => {
    const formatDate = (dateStr: string) => dateStr.replace(/-/g, '');
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const startDate = formatDate(deadline.dueDate);

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GestImmoPRO//IT',
        'BEGIN:VEVENT',
        `UID:${deadline.id}@gestimmopro.app`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `SUMMARY:${deadline.title} (${propertyName})`,
        `DESCRIPTION:Scadenza per l'immobile: ${propertyName}. Tipo: ${deadline.type}${deadline.typeOther ? ` (${deadline.typeOther})` : ''}.`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const sanitizedTitle = deadline.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${sanitizedTitle}.ics`);
    document.body.appendChild(link);
    link.click