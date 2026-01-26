import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Member, Prisma } from "@prisma/client";

@Injectable()
export class MemberRepository {
  constructor(private prisma: PrismaService) {
  }

  async selectByUnique(
    where: Prisma.MemberWhereUniqueInput,
  ): Promise<Omit<Member, "password"> | null> {
    return this.prisma.db.member.findUnique({
      where,
      select: {
        password: false,
        idx: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async selectByUniqueWithPassword(
    where: Prisma.MemberWhereUniqueInput,
  ): Promise<Member | null> {
    return this.prisma.db.member.findUnique({
      where,
    });
  }

  async selectOne(
    where: Prisma.MemberWhereInput,
  ): Promise<Omit<Member, "password"> | null> {
    return this.prisma.db.member.findFirst({
      where,
      select: {
        password: false,
        idx: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async createMember(
    data: Prisma.MemberCreateInput,
  ): Promise<Member> {
    return this.prisma.db.member.create({
      data,
    });
  }

  async updateMember(params: {
    where: Prisma.MemberWhereUniqueInput;
    data: Prisma.MemberUpdateInput;
  }): Promise<Member> {
    const { where, data } = params;
    return this.prisma.db.member.update({
      data,
      where,
    });
  }

  async deleteMember(
    where: Prisma.MemberWhereUniqueInput,
  ): Promise<Member> {
    return this.prisma.db.member.delete({
      where,
    });
  }

}