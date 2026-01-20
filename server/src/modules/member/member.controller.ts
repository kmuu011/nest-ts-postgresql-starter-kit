import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { MemberService } from "./member.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { BaseController } from "../../common/base/base.controller";
import type { Request, Response } from "express";
import { AuthGuard } from "../../guard/auth.guard";
import { DuplicateCheckDto } from "./dto/duplicate-check.dto";
import { SuccessResponseDto, LoginResponseDto, DuplicateCheckResponseDto } from "../../common/dto/common-response.dto";

@ApiTags('Member')
@Controller("member")
export class MemberController extends BaseController {
  constructor(
    private readonly memberService: MemberService,
  ) {
    super();
  }

  @Post("/login")
  @ApiOperation({ summary: '로그인', description: '사용자 로그인' })
  @ApiResponse({ status: 201, description: '로그인 성공', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionKey = await this.memberService.login(
      loginDto,
      req,
      res,
    );

    return { sessionKey };
  }

  @Post("/signup")
  @ApiOperation({ summary: '회원가입', description: '새로운 회원 등록' })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: SuccessResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async signup(
    @Body() signupDto: SignupDto
  ) {
    await this.memberService.signUp(signupDto);

    return this.sendSuccess();
  }

  @Get("/duplicateCheck")
  @ApiOperation({ summary: '중복 체크', description: 'ID/Email 중복 확인' })
  @ApiResponse({ status: 200, description: '중복 체크 완료', type: DuplicateCheckResponseDto })
  async duplicateCheck(
    @Query() { key, value }: DuplicateCheckDto
  ) {
    const isDuplicated = !!(await this.memberService.duplicateCheck(
      key,
      value
    ));

    return { isDuplicated };
  }

  @UseGuards(AuthGuard)
  @Get("/authCheck")
  @ApiSecurity('session-key')
  @ApiOperation({ summary: '인증 확인', description: '사용자 인증 상태 확인' })
  @ApiResponse({ status: 200, description: '인증 성공', schema: { type: 'string', example: 'authCheck' } })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async authCheck(
    @Req() req: Request
  ) {

    return "authCheck";
  }

}