import { Injectable } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { SignupDto } from "./dto/signup.dto";
import { Message } from "../../utils/MessageUtility";
import { keyDescriptionObj } from "../../constants/keyDescriptionObj";
import { DuplicateCheckKey } from "./member.type";
import { EncryptUtility } from "../../utils/EncryptUtility";
import { LoginDto } from "./dto/login.dto";
import { Member } from "@prisma/client";
import { Utility } from "../../utils/Utility";
import type { Request, Response } from "express";
import { SessionService } from "../../common/session/session.service";
import { CookieUtility } from "../../utils/CookieUtility";
import { Transactional } from "../../common/prisma/transactional.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
  ) {
  }

  async login(
    loginDto: LoginDto,
    req: Request,
    res: Response
  ) {
    loginDto.password = EncryptUtility.encryptMemberPassword(loginDto.password);

    const memberInfo = await this.memberRepository.selectByUnique(
      loginDto
    );

    if (!memberInfo) {
      throw Message.NOT_EXIST(keyDescriptionObj.member);
    }

    const clientInfo = Utility.getClientInfo(req);

    const sessionKey = await this.sessionService.create(
      memberInfo.idx,
      clientInfo.userAgent
    )

    CookieUtility.setSessionKey(res, sessionKey);

    return sessionKey;
  }

  async duplicateCheck(
    key: DuplicateCheckKey,
    value: string,
  ): Promise<Omit<Member, "password"> | null> {
    return this.memberRepository.selectByUnique({
      [key]: value,
    });
  }

  @Transactional()
  async signUp(
    signupDto: SignupDto,
  ): Promise<void> {
    if (await this.duplicateCheck("id", signupDto.id)) {
      throw Message.ALREADY_EXIST(keyDescriptionObj.id);
    }

    signupDto.password = EncryptUtility.encryptMemberPassword(signupDto.password);

    const member = await this.memberRepository.createMember(signupDto);

    // await this.prisma.db.memo.create({
    //   data: {
    //     memo: "테스트 메모 입니다.",
    //     memberIdx: member.idx,
    //   },
    // });
  }
}