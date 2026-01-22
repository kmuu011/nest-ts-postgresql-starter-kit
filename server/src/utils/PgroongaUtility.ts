import { Prisma } from "@prisma/client";

export class PgroongaUtility {
  static createSearchCondition(
    keyword?: string,
    columnName: string = "content",
    tableAlias?: string
  ): Prisma.Sql {
    const tokens = this.parseKeywordToTokens(keyword);
    
    if (tokens.length === 0) {
      return Prisma.sql``;
    }

    const column = tableAlias ? `${tableAlias}."${columnName}"` : `"${columnName}"`;

    return Prisma.sql`${Prisma.join(
      tokens.map(token => Prisma.sql`AND ${Prisma.raw(column)} &@ ${token}`),
      ' '
    )}`;
  }

  /**
   * 검색 조건을 Prisma.Sql로 반환 (AND 없이)
   * OR 조건 등 복잡한 조건을 만들 때 사용
   */
  static createSearchConditionRaw(
    keyword?: string,
    columnName: string = "content",
    tableAlias?: string
  ): Prisma.Sql {
    const tokens = this.parseKeywordToTokens(keyword);
    
    if (tokens.length === 0) {
      return Prisma.sql`1=1`; // 항상 true 조건
    }

    const column = tableAlias ? `${tableAlias}."${columnName}"` : `"${columnName}"`;

    return Prisma.join(
      tokens.map(token => Prisma.sql`${Prisma.raw(column)} &@ ${token}`),
      ' AND '
    );
  }

  static parseKeywordToTokens(keyword?: string): string[] {
    return (keyword ?? '')
      .trim()
      .split(/\s/)
      .filter(Boolean);
  }
}
