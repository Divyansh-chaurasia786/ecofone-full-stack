import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    uid?: string;
    recipientName: string;
    type: string;
    role: string;
    startDate: string;
    endDate: string;
    issueDate: string;
    description: string;
    authorizedSignatory: string;
    registeredOffice: string;
    website: string;
    email: string;
    cin: string;
  }) {
    let finalUid = data.uid ? data.uid.trim().toUpperCase() : '';
    if (!finalUid) {
      const typeCode = (data.type || 'INTERNSHIP').substring(0, 3).toUpperCase();
      const year = new Date(data.issueDate || Date.now()).getFullYear();
      finalUid = `EVG-${typeCode}-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Check if UID already exists
    const existing = await this.prisma.certificate.findUnique({
      where: { uid: finalUid },
    });
    if (existing) {
      if (data.uid) {
        throw new ConflictException(`Certificate with UID ${data.uid} already exists.`);
      } else {
        // Regenerate if auto-generated UID collided
        finalUid = `EVG-${(data.type || 'INT').substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      }
    }

    return this.prisma.certificate.create({
      data: {
        uid: finalUid,
        recipientName: data.recipientName.trim().toUpperCase(),
        type: data.type.toUpperCase(),
        role: data.role,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        issueDate: new Date(data.issueDate),
        description: data.description,
        authorizedSignatory: data.authorizedSignatory,
        registeredOffice: data.registeredOffice,
        website: data.website,
        email: data.email,
        cin: data.cin,
      },
    });
  }

  async list() {
    return this.prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.certificate.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Certificate with ID ${id} not found.`);
    }

    return this.prisma.certificate.delete({
      where: { id },
    });
  }

  async verify(uid: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { uid },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with UID ${uid} is not registered or is invalid.`);
    }
    return certificate;
  }
}
