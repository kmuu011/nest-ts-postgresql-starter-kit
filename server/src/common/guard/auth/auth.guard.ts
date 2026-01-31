import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { SessionService } from "../../session/session.service";
import { MemberRepository } from "../../../domain/member/member.repository";
import { Request, Response } from "express";
import { NEW_SESSION_KEY, SESSION_KEY } from "../../constants/session";
import { Message } from "../../utils/MessageUtility";
import { Utility } from "../../utils/Utility";
import { config } from "../../../config";
import { CookieUtility } from "../../utils/CookieUtility";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly memberRepository: MemberRepository
  ) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const now = Date.now();
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const sessionKey: string | undefined = req.cookies[SESSION_KEY] || req.headers[SESSION_KEY];

    if (!sessionKey) throw Message.UNAUTHORIZED;

    const sessionData = await this.sessionService.get(sessionKey);
    if (!sessionData?.memberIdx) throw Message.UNAUTHORIZED;

    const clientInfo = Utility.getClientInfo(req);
    if (clientInfo.userAgent !== sessionData.userAgent) throw Message.UNAUTHORIZED;

    const memberInfo = await this.memberRepository.selectByUnique({
      idx: sessionData.memberIdx
    });
    if (!memberInfo) throw Message.UNAUTHORIZED;

    req.memberInfo = memberInfo;

    // keepLogin이 false인 경우 세션 갱신하지 않음
    if (!sessionData.keepLogin) return true;

    // 세션 만료까지 refreshTime 보다 오래 남은경우 갱신하지 않고 return
    if ((sessionData.ttl - now) / 1000 > config.memberAuth.session.refreshTime) return true;

    const newSessionKey = await this.sessionService.create(memberInfo.idx, clientInfo.userAgent, sessionData.keepLogin);

    CookieUtility.setSessionKey(res, newSessionKey);

    res.header(NEW_SESSION_KEY, newSessionKey);

    return true;
  }
}
