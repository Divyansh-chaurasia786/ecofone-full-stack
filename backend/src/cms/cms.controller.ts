import { Controller, Post, Get, Delete, Patch, Body, Query, Param, Res, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CmsService } from './cms.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString, IsEmail, Matches, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  mapsUrl?: string;
}

export class ApplyJobDto {
  @IsNotEmpty()
  @IsString()
  jobId: string;

  @IsNotEmpty()
  @IsString()
  candidateName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be E.164 formatted' })
  phone: string;
}

export class SubmitReviewDto {
  @IsNotEmpty()
  @IsString()
  authorName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  verifiedProduct?: string;
}

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsArray()
  history: { sender: 'USER' | 'AI'; text: string }[];
}

@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Get('env-check')
  async checkEnv() {
    return {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV || 'undefined'
    };
  }

  @Get('blogs')
  async getBlogs() {
    return this.cmsService.getBlogPosts();
  }

  @Get('blogs/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  @Get('reviews')
  async getReviews() {
    return this.cmsService.getReviews();
  }

  @Get('reviews/admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllReviewsAdmin() {
    return this.cmsService.getAllReviewsAdmin();
  }

  @Patch('reviews/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateReviewStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.cmsService.updateReviewStatus(id, body.status);
  }

  @Patch('reviews/:id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async replyToReview(@Param('id') id: string, @Body() body: { reply: string }) {
    return this.cmsService.replyToReview(id, body.reply);
  }

  @Patch('reviews/:id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async verifyReview(
    @Param('id') id: string,
    @Body() body: { isVerified: boolean; verifiedProduct?: string }
  ) {
    return this.cmsService.verifyReview(id, body.isVerified, body.verifiedProduct);
  }

  @Delete('reviews/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteReview(@Param('id') id: string) {
    return this.cmsService.deleteReview(id);
  }

  @Patch('reviews/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateReview(
    @Param('id') id: string,
    @Body() body: { authorName?: string; rating?: number; comment?: string; verifiedProduct?: string }
  ) {
    return this.cmsService.updateReview(id, body);
  }

  @Post('reviews')
  async submitReview(@Body() body: SubmitReviewDto) {
    return this.cmsService.submitReview(body.authorName, body.rating, body.comment, body.verifiedProduct);
  }

  @Get('jobs')
  async getJobs() {
    return this.cmsService.getJobListings();
  }

  @Post('careers/apply')
  @UseInterceptors(FileInterceptor('resume'))
  async applyToJob(@Body() body: ApplyJobDto, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Resume document file (PDF/Docx) is required');
    }
    // file.buffer contains the resume file buffer
    return this.cmsService.applyToJob(
      body.jobId,
      body.candidateName,
      body.email,
      body.phone,
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  @Get('stores')
  async getStores(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    return this.cmsService.locateStores(userLat, userLng);
  }

  @Post('ai/chat')
  async aiChat(@Body() body: ChatMessageDto) {
    return this.cmsService.qualifyAiChatReply(body.message, body.history);
  }

  @Post('stores')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addStore(@Body() body: CreateStoreDto) {
    return this.cmsService.addStore(body);
  }

  @Delete('stores/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteStore(@Param('id') id: string) {
    return this.cmsService.deleteStore(id);
  }

  @Patch('stores/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateStore(
    @Param('id') id: string,
    @Body() body: { type?: string; address?: string; phone?: string; mapsUrl?: string; latitude?: number; longitude?: number },
  ) {
    return this.cmsService.updateStore(id, body);
  }

  @Get('leads/download')
  async downloadLeads(@Res() res: any) {
    const csv = await this.cmsService.exportLeadsCsv();
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="ecofone_leads_export.csv"');
    return res.send(csv);
  }

  @Get('resolve-maps')
  async resolveMaps(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }
    return this.cmsService.resolveMapsUrl(url);
  }

  @Get('geocode')
  async geocodeAddress(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('Address parameter is required');
    }
    return this.cmsService.geocodeAddress(address);
  }

  // Team Members Endpoints
  @Get('team-version')
  async getTeamVersion() {
    return { version: 'v2_database_active' };
  }

  @Get('team')
  async getTeamMembers() {
    return this.cmsService.getTeamMembers();
  }

  @Post('team')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addTeamMember(@Body() body: { name: string; role: string; bio: string; initials?: string; imageUrl?: string; linkedinUrl?: string; twitterUrl?: string; githubUrl?: string }) {
    return this.cmsService.addTeamMember({
      name: body.name,
      role: body.role,
      bio: body.bio,
      initials: body.initials || '',
      imageUrl: body.imageUrl || '',
      linkedinUrl: body.linkedinUrl || '',
      twitterUrl: body.twitterUrl || '',
      githubUrl: body.githubUrl || ''
    });
  }

  @Patch('team-reorder')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async reorderTeamMembers(@Body() body: { ids: string[] }) {
    return this.cmsService.reorderTeamMembers(body.ids);
  }

  @Patch('team/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateTeamMember(
    @Param('id') id: string,
    @Body() body: { name?: string; role?: string; bio?: string; initials?: string; imageUrl?: string; linkedinUrl?: string; twitterUrl?: string; githubUrl?: string }
  ) {
    return this.cmsService.updateTeamMember(id, body);
  }

  @Delete('team/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteTeamMember(@Param('id') id: string) {
    return this.cmsService.deleteTeamMember(id);
  }
}
