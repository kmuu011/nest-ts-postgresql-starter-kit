import { Injectable } from '@nestjs/common';
import { MemoRepository } from './memo.repository';
import { BaseService } from 'src/common/base/base.service';
import { PaginatedServiceData } from 'src/types/common';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { FileService } from '../file/file.service';
import { FileRepository } from '../file/file.repository';
import { Memo } from '@prisma/client';

@Injectable()
export class MemoService extends BaseService {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly fileService: FileService,
    private readonly fileRepository: FileRepository
  ) {
    super();
  }

  /**
   * content JSON에서 type이 text, list인 노드의 텍스트를 모두 합쳐 반환
   */
  private extractTextFromContent(content: any): string {
    const parts: string[] = [];

    if (!content || typeof content !== 'object') {
      return '';
    }

    const traverse = (node: any) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      if (node.type === 'text' && typeof node.text === 'string' && node.text.trim()) {
        parts.push(node.text.trim());
      }

      if (node.type === 'list') {
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any) => traverse(child));
        }
      }

      if (node.type !== 'text' && node.type !== 'list' && Array.isArray(node.children)) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    const root = content.root && typeof content.root === 'object' ? content.root : content;
    traverse(root);
    return parts.join(' ').trim();
  }

  /**
   * content JSON에서 파일키를 추출하는 함수
   * type이 file, video, image인 노드의 src에서 파일키 추출
   */
  private extractFileKeysFromContent(content: any): string[] {
    const fileKeys: string[] = [];
    
    if (!content || typeof content !== 'object') {
      return fileKeys;
    }

    const traverse = (node: any) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      // type이 file, video, image인 경우 src에서 파일키 추출
      if (node.type === 'file' || node.type === 'video' || node.type === 'image') {
        if (node.src && typeof node.src === 'string') {
          // src에서 /static/files/파일키.확장자 형식 추출
          const match = node.src.match(/\/static\/files\/([^\/\?]+)/);
          if (match && match[1]) {
            fileKeys.push(match[1]);
          }
        }
      }

      // children 배열이 있으면 재귀적으로 탐색
      if (Array.isArray(node.children)) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    traverse(content);
    return [...new Set(fileKeys)]; // 중복 제거
  }

  /**
   * 파일키 목록으로 파일들의 memoIdx 업데이트
   */
  private async updateFileMemoIdx(fileKeys: string[], memoIdx: number): Promise<void> {
    for (const fileKey of fileKeys) {
      try {
        const file = await this.fileRepository.findByFileKey(fileKey);
        if (file) {
          await this.fileRepository.updateMemoIdx(fileKey, memoIdx);
        }
      } catch (error) {
        // 파일을 찾을 수 없거나 업데이트 실패 시 무시하고 계속 진행
        console.error(`Failed to update memoIdx for file ${fileKey}:`, error);
      }
    }
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    search: string,
    archived?: boolean
  ): Promise<PaginatedServiceData<Memo>> {
    const keyword = search?.trim() || undefined;

    const memoList = await this.memoRepository.selectList(
      memberIdx,
      page,
      count,
      keyword,
      archived
    );

    const memoCount = await this.memoRepository.selectCount(
      memberIdx,
      keyword,
      archived
    );

    return this.returnListType({
      itemList: memoList,
      page,
      count,
      totalCount: memoCount
    });
  }

  async selectOne(
    memberIdx: number,
    memoIdx: number
  ): Promise<Memo | null> {
    const memo = await this.memoRepository.selectOne(
      memberIdx,
      memoIdx
    );

    if (!memo) {
      throw Message.NOT_EXIST(keyDescriptionObj.memo);
    }

    return memo;
  }

  async create(
    memberIdx: number,
    saveMemoDto: SaveMemoDto
  ): Promise<Memo> {
    const { content, ...rest } = saveMemoDto;
    const text = content ? this.extractTextFromContent(content) : undefined;

    const memo = await this.memoRepository.create({
      ...rest,
      ...(content !== undefined && { content }),
      ...(text !== undefined && text !== '' && { text }),
      member: { connect: { idx: memberIdx } },
    });
    
    // content에서 파일키 추출 후 memoIdx 업데이트
    if (content) {
      const fileKeys = this.extractFileKeysFromContent(content);
      if (fileKeys.length > 0) {
        await this.updateFileMemoIdx(fileKeys, memo.idx);
      }
    }
    
    return memo;
  }

  async update(
    memberIdx: number,
    memoIdx: number,
    saveMemoDto: SaveMemoDto
  ): Promise<Memo> {
    const { content, ...rest } = saveMemoDto;
    const text = content ? this.extractTextFromContent(content) : undefined;

    const data: any = { ...rest };
    if (content !== undefined) data.content = content;
    if (text !== undefined) data.text = text;

    const updatedMemo = await this.memoRepository.update({
      where: {
        idx: memoIdx,
        memberIdx
      },
      data,
    });

    // content에서 파일키 추출 후 memoIdx 업데이트
    if (content) {
      const fileKeys = this.extractFileKeysFromContent(content);
      if (fileKeys.length > 0) {
        await this.updateFileMemoIdx(fileKeys, memoIdx);
      }
    }

    return updatedMemo;
  }

  async delete(
    memberIdx: number,
    memoIdx: number
  ): Promise<Boolean> {
    // 메모에 연결된 파일 idx 목록 조회
    const fileIdxList = await this.memoRepository.selectFileIdxListByMemo(memberIdx, memoIdx);

    // 메모 삭제
    await this.memoRepository.delete({
      idx: memoIdx,
      memberIdx
    });

    // 연결되어 있던 파일들 삭제 (DB + 스토리지, 사용 중 체크 스킵)
    for (const fileIdx of fileIdxList) {
      await this.fileService.delete(memberIdx, fileIdx, true);
    }

    return true;
  }
}

