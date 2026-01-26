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
import { ChangePasswordDto } from "./dto/change-password.dto";
import { MemoRepository } from "../memo/memo.repository";

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
    private readonly memoRepository: MemoRepository,
  ) {
  }

  async login(
    loginDto: LoginDto,
    req: Request,
    res: Response
  ) {
    loginDto.password = EncryptUtility.encryptMemberPassword(loginDto.password);

    // keepLogin은 DB 필드가 아니므로 제외하고 전달
    const { keepLogin, ...memberWhereInput } = loginDto;
    const memberInfo = await this.memberRepository.selectByUnique(
      memberWhereInput
    );

    if (!memberInfo) {
      throw Message.NOT_EXIST(keyDescriptionObj.member);
    }

    const clientInfo = Utility.getClientInfo(req);

    const sessionKey = await this.sessionService.create(
      memberInfo.idx,
      clientInfo.userAgent,
      loginDto.keepLogin || false
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

    // 회원가입 시 기본 메모 생성
    await this.memoRepository.create({
      title: "환영합니다",
      content: {
        root: {
          type: "root",
          version: 1,
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "메모를 작성해보세요!"
                }
              ]
            }
          ]
        }
      },
      text: "메모를 작성해보세요!",
      member: { connect: { idx: member.idx } },
    });
  }

  @Transactional()
  async changePassword(
    memberIdx: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const member = await this.memberRepository.selectByUniqueWithPassword({
      idx: memberIdx,
    });

    if (!member) {
      throw Message.NOT_EXIST(keyDescriptionObj.member);
    }

    const encryptedCurrentPassword = EncryptUtility.encryptMemberPassword(
      changePasswordDto.currentPassword
    );

    if (member.password !== encryptedCurrentPassword) {
      throw Message.UNAUTHORIZED;
    }

    const encryptedNewPassword = EncryptUtility.encryptMemberPassword(
      changePasswordDto.newPassword
    );

    await this.memberRepository.updateMember({
      where: { idx: memberIdx },
      data: { password: encryptedNewPassword },
    });
  }
}