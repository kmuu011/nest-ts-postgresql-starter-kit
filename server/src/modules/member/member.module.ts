import {Module} from "@nestjs/common";
import {MemberController} from "./member.controller";
import {MemberService} from "./member.service";
import {MemberRepository} from "./member.repository";
import {SessionService} from "../../common/session/session.service";

@Module({
  imports: [],
  controllers: [
    MemberController
  ],
  providers: [
    MemberService,
    MemberRepository,
    SessionService
  ]
})

export class MemberModule {
}