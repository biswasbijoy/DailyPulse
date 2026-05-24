import ExcelJS from 'exceljs';
import type { Task } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  completed: '92D050',
  pending: 'FFC000',
  in_progress: '5B9BD5',
  postponed: 'ED7D31',
  cancelled: 'A5A5A5',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'FF0000',
  medium: 'FFC000',
  low: '70AD47',
};

function statusLabel(status: string): string {
  if (status === 'postponed') return 'Rescheduled';
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function exportTasksToExcel(tasks: Task[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DailyPulse';
  workbook.created = new Date();

  const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.currentDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // ─── SUMMARY SHEET ────────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Summary', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const postponed = tasks.filter((t) => t.status === 'postponed').length;

  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'DailyPulse — Task History Summary';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5496' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 35;

  const headerRow = summarySheet.getRow(2);
  headerRow.values = ['Metric', 'Value', 'Percentage', ''];
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 25;

  const summaryData: [string, number | string, string][] = [
    ['Total Tasks', totalTasks, '100%'],
    ['Completed', completed, totalTasks > 0 ? `${((completed / totalTasks) * 100).toFixed(1)}%` : '0%'],
    ['Pending', pending, totalTasks > 0 ? `${((pending / totalTasks) * 100).toFixed(1)}%` : '0%'],
    ['In Progress', inProgress, totalTasks > 0 ? `${((inProgress / totalTasks) * 100).toFixed(1)}%` : '0%'],
    ['Rescheduled', postponed, totalTasks > 0 ? `${((postponed / totalTasks) * 100).toFixed(1)}%` : '0%'],
  ];

  summaryData.forEach((row, idx) => {
    const rowNum = idx + 3;
    const r = summarySheet.getRow(rowNum);
    r.values = row;
    r.eachCell((cell, col) => {
      cell.font = { name: 'Calibri', size: 11 };
      cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    r.height = 22;
  });

  summarySheet.getColumn(1).width = 20;
  summarySheet.getColumn(2).width = 15;
  summarySheet.getColumn(3).width = 15;

  // ─── TASKS DETAIL SHEET ────────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('Tasks', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const headers = [
    'Date', 'Title', 'Description', 'Status', 'Priority',
    'Category', 'Tags', 'Original Date', 'Due Date',
    'Est. Minutes', 'Actual Minutes', 'Rescheduled Count',
    'Created At', 'Updated At', 'Completed At',
  ];

  const headerRowD = detailSheet.getRow(1);
  headerRowD.values = headers;
  headerRowD.height = 28;
  headerRowD.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5496' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });

  let rowIdx = 2;
  for (const date of sortedDates) {
    const dateTasks = grouped[date];

    const dateHeaderCell = detailSheet.getCell(rowIdx, 1);
    detailSheet.mergeCells(`A${rowIdx}:O${rowIdx}`);
    dateHeaderCell.value = date;
    dateHeaderCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    dateHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    dateHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
    detailSheet.getRow(rowIdx).height = 24;
    rowIdx++;

    for (const task of dateTasks) {
      const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const updatedAt = task.updatedAt ? new Date(task.updatedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const completedAt = task.completedAt ? new Date(task.completedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      const row = detailSheet.getRow(rowIdx);
      row.values = [
        task.currentDate,
        task.title,
        task.description || '',
        statusLabel(task.status),
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
        task.category || '',
        (task.tags || []).join(', '),
        task.taskDate,
        task.dueDate || '',
        task.estimatedMinutes ?? '',
        task.actualMinutes ?? '',
        task.postponedCount,
        createdAt,
        updatedAt,
        completedAt,
      ];

      const statusColor = STATUS_COLORS[task.status];
      if (statusColor) {
        row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } };
        row.getCell(4).font = { bold: true, color: { argb: 'FF000000' } };
      }

      const priorityColor = PRIORITY_COLORS[task.priority];
      if (priorityColor) {
        row.getCell(5).font = { bold: true, color: { argb: priorityColor } };
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      row.height = 22;
      rowIdx++;
    }
  }

  detailSheet.getColumn(1).width = 14;
  detailSheet.getColumn(2).width = 30;
  detailSheet.getColumn(3).width = 30;
  detailSheet.getColumn(4).width = 14;
  detailSheet.getColumn(5).width = 12;
  detailSheet.getColumn(6).width = 14;
  detailSheet.getColumn(7).width = 20;
  detailSheet.getColumn(8).width = 14;
  detailSheet.getColumn(9).width = 14;
  detailSheet.getColumn(10).width = 12;
  detailSheet.getColumn(11).width = 12;
  detailSheet.getColumn(12).width = 14;
  detailSheet.getColumn(13).width = 20;
  detailSheet.getColumn(14).width = 20;
  detailSheet.getColumn(15).width = 20;

  // ─── GENERATE BUFFER ─────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DailyPulse_Tasks_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
