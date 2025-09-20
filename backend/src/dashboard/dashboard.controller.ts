import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './interfaces/dashboard-data.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('data')
  async getDashboardData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardData> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    return await this.dashboardService.getDashboardData(start, end);
  }
}