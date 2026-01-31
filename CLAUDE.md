다음 규칙으로 API를 만든다.

guard는 common/guard/<도메인>하위에에 두고,
공용 dto는 common/dto/<도메인>/ 하위에 구현한다

controller, dto, module 은
src/modules/<도메인>/ 하위에 둔다
여기서 dto는 response, request에 해당하는 dto만 군다.

service, repository 는
src/domain/<도메인>/ 하위에 둔다.

modules 는 HTTP/API 계층만 담당하고
domain 은 비즈니스 로직과 DB 접근만 담당한다.

controller에서는 요청 처리, DTO 검증, guard 적용만 하고
실제 로직은 domain의 service로 위임한다.

repository는 DB 접근만 담당하며 controller나 DTO를 알면 안 된다.

GET, POST, PATCH, DELETE 메소드만 사용하며

앞으로 모든 API는 이 구조를 기준으로 구현한다.