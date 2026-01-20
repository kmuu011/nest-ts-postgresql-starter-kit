// prisma.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";

type TxClient = Prisma.TransactionClient;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly als = new AsyncLocalStorage<TxClient>();
  private readonly baseClient: PrismaClient;

  constructor() {
    super();
    this.baseClient = this.$extends({}) as unknown as PrismaClient;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * 트랜잭션 컨텍스트가 있으면 TxClient, 없으면 확장된 기본 PrismaClient
   */
  get db(): TxClient | PrismaClient {
    const store = this.als.getStore();
    return store ?? this.baseClient;
  }

  /**
   * 트랜잭션 진입: ALS 안에 tx 넣고, fn 전체를 그 컨텍스트에서 실행
   */
  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.$transaction((tx) =>
      this.als.run(tx, () => fn()),
    );
  }
}
