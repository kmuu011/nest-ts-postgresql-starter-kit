import { Module } from "@nestjs/common";
import { MemberController } from "./member.controller";
import { MemoModule } from '@/modules/memo/memo.module';
import { MemberService } from '@/domain/member/member.service';
import { MemberRepository } from '@/domain/member/member.repository';
import { SessionService } from '@/common/session/session.service';

@Module({
  imports: [MemoModule],
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