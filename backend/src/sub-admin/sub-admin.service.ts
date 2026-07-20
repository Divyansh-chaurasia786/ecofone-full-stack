import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SubAdminService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const admins = await this.prisma.subAdmin.findMany({
      select: { id: true, username: true, permissions: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return admins;
  }

  async create(data: { username: string; password: string; permissions: string[] }) {
    const username = data.username.trim().toLowerCase();

    if (username === 'admin' || username === 'master') {
      throw new BadRequestException('Username "admin" or "master" is reserved.');
    }

    const existing = await this.prisma.subAdmin.findUnique({ where: { username } });
    if (existing) {
      throw new ConflictException(`Sub-admin with username "${username}" already exists.`);
    }

    // Count existing sub-admins — max 4
    const count = await this.prisma.subAdmin.count();
    if (count >= 4) {
      throw new BadRequestException('Maximum limit of 4 sub-admins reached.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const subAdmin = await this.prisma.subAdmin.create({
      data: {
        username,
        password: passwordHash,
        permissions: data.permissions,
      },
      select: { id: true, username: true, permissions: true, createdAt: true },
    });

    return subAdmin;
  }

  async remove(id: string) {
    const existing = await this.prisma.subAdmin.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Sub-admin not found.');
    }
    await this.prisma.subAdmin.delete({ where: { id } });
    return { success: true, message: `Sub-admin "${existing.username}" deleted.` };
  }

  /** Verify a specific sub-admin's password by ID */
  async verifyPassword(id: string, password: string) {
    const sa = await this.prisma.subAdmin.findUnique({ where: { id } });
    if (!sa) throw new NotFoundException('Sub-admin not found.');
    const match = await bcrypt.compare(password, sa.password);
    return { valid: match };
  }

  /** Password-only login — matches against all sub-admins */
  async login(password: string) {
    const all = await this.prisma.subAdmin.findMany();

    for (const sa of all) {
      const match = await bcrypt.compare(password, sa.password);
      if (match) {
        const payload = {
          id: sa.id,
          username: sa.username,
          role: 'SUB_ADMIN',
          permissions: sa.permissions,
        };
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || 'ecofone_jwt_super_secret_key',
          { expiresIn: '7d' },
        );
        return {
          token,
          user: {
            id: sa.id,
            username: sa.username,
            role: 'SUB_ADMIN',
            permissions: sa.permissions,
          },
        };
      }
    }

    throw new UnauthorizedException('Incorrect password.');
  }

  async updatePassword(id: string, password: string) {
    const existing = await this.prisma.subAdmin.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Sub-admin not found.');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.subAdmin.update({
      where: { id },
      data: { password: passwordHash }
    });
    return { success: true, message: `Sub-admin "${existing.username}" password updated.` };
  }

  async updatePermissions(id: string, permissions: string[]) {
    const existing = await this.prisma.subAdmin.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Sub-admin not found.');
    }
    const updated = await this.prisma.subAdmin.update({
      where: { id },
      data: { permissions },
      select: { id: true, username: true, permissions: true, createdAt: true }
    });
    return updated;
  }
}
