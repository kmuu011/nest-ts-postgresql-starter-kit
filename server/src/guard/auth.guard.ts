import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {SessionService} from "../common/session/session.service";
import {MemberRepository} from "../modules/member/member.repository";
import {Request, Response} from "express";
import {SESSION_ID_KEY} from "../constants/session";
import {Message} from "../utils/MessageUtility";
import {Utility} from "../utils/Utility";
import {CacheService} from "../common/cache/cache.service";
import {config} from "../config";
import {CookieUtility} from "../utils/CookieUtility";

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

    const sessionId: string | undefined = req.cookies[SESSION_ID_KEY] || req.headers[SESSION_ID_KEY];
    if (!sessionId) throw Message.UNAUTHORIZED;

    const sessionData = await this.sessionService.get(sessionId);
    if (!sessionData?.memberIdx) throw Message.UNAUTHORIZED;

    const clientInfo = Utility.getClientInfo(req);
    if (clientInfo.userAgent !== sessionData.userAgent) throw Message.UNAUTHORIZED;

    const memberInfo = await this.memberRepository.selectByUnique({
      idx: sessionData.memberIdx
    });
    if (!memberInfo) throw Message.UNAUTHORIZED;

    req.memberInfo = memberInfo;

    // 세션 만료까지 refreshTime 보다 오래 남은경우 갱신하지 않고 return
    if ((sessionData.ttl - now) / 1000 > config.memberAuth.session.refreshTime) return true;

    const newSessionId = await this.sessionService.create(memberInfo.idx, clientInfo.userAgent);

    CookieUtility.setSessionId(res, newSessionId);

    res.header("newSessionId", newSessionId);

    return true;
  }
}