import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';
import { CreateUserDto, UpdateUserDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashPassword(dto.password) },
    });
    return toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.password && { password: hashPassword(dto.password) }),
      },
    });
    return toSafeUser(user);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return toSafeUser(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(toSafeUser);
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function toSafeUser<T extends { password: string }>(user: T): Omit<T, 'password'> {
  const safeUser: Partial<T> = { ...user };
  delete safeUser.password;
  return safeUser as Omit<T, 'password'>;
}
