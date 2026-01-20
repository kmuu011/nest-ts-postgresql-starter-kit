import { config } from '../src/config';

// BigInt를 JSON으로 직렬화할 수 있도록 전역 설정
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// 테스트 타임아웃 설정
jest.setTimeout(30000);
