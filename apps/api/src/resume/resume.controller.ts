import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  // ── Profile (auth required) ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.resumeService.updateProfile(dto);
  }

  // ── Skills ────────────────────────────────────────────────────────────────

  @Get('skills')
  findAllSkills() {
    return this.resumeService.findAllSkills();
  }

  @UseGuards(JwtAuthGuard)
  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  createSkill(@Body() dto: CreateSkillDto) {
    return this.resumeService.createSkill(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('skills/:id')
  updateSkill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.resumeService.updateSkill(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('skills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSkill(@Param('id', ParseUUIDPipe) id: string) {
    return this.resumeService.deleteSkill(id);
  }

  // ── Experience ────────────────────────────────────────────────────────────

  @Get('experience')
  findAllExperience() {
    return this.resumeService.findAllExperience();
  }

  @UseGuards(JwtAuthGuard)
  @Post('experience')
  @HttpCode(HttpStatus.CREATED)
  createExperience(@Body() dto: CreateExperienceDto) {
    return this.resumeService.createExperience(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('experience/:id')
  updateExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.resumeService.updateExperience(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('experience/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteExperience(@Param('id', ParseUUIDPipe) id: string) {
    return this.resumeService.deleteExperience(id);
  }

  // ── Education ─────────────────────────────────────────────────────────────

  @Get('education')
  findAllEducation() {
    return this.resumeService.findAllEducation();
  }

  @UseGuards(JwtAuthGuard)
  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  createEducation(@Body() dto: CreateEducationDto) {
    return this.resumeService.createEducation(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('education/:id')
  updateEducation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.resumeService.updateEducation(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('education/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEducation(@Param('id', ParseUUIDPipe) id: string) {
    return this.resumeService.deleteEducation(id);
  }

  // ── Public slug endpoint (must be last — after all static routes) ─────────

  /** GET /v1/resume/:slug — Full resume snapshot for a given profile slug. */
  @Get(':slug')
  getResume(@Param('slug') slug: string) {
    return this.resumeService.getResume(slug);
  }
}
