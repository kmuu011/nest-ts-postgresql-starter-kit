import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { MemberService } from "./member.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { BaseController } from "../../common/base/base.controller";
import type { Request, Response } from "express";
import { AuthGuard } from "../../guard/auth.guard";
import { DuplicateCheckDto } from "./dto/duplicate-check.dto";

@Controller("member")
export class MemberController extends BaseController {
  constructor(
    private readonly memberService: MemberService,
  ) {
    super();
  }

  @Post("/login")
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
  async signup(
    @Body() signupDto: SignupDto
  ) {
    await this.memberService.signUp(signupDto);

    return this.sendSuccess();
  }

  @Get("/duplicateCheck")
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
  async authCheck(
    @Req() req: Request
  ) {

    return "authCheck";
  }

}