import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, CreateUserDto, UpdateUserDto, USER_PATTERNS } from '@esp/shared';
import { MASTER_SERVICE_CLIENT } from './master-service.client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(MASTER_SERVICE_CLIENT) private readonly masterServiceClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiOkResponse({ description: 'The created user' })
  async create(@Body() dto: CreateUserDto): Promise<ApiResponse> {
    const data = await firstValueFrom(
      this.masterServiceClient.send(USER_PATTERNS.CREATE, dto),
    );
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ description: 'The updated user' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponse> {
    const data = await firstValueFrom(
      this.masterServiceClient.send(USER_PATTERNS.UPDATE, { id, dto }),
    );
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ description: 'The requested user' })
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const data = await firstValueFrom(
      this.masterServiceClient.send(USER_PATTERNS.FIND_ONE, id),
    );
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'All users' })
  async findAll(): Promise<ApiResponse> {
    const data = await firstValueFrom(
      this.masterServiceClient.send(USER_PATTERNS.FIND_ALL, {}),
    );
    return { success: true, data };
  }
}
