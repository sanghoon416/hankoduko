-- Implicit casts for enum types (DataGrip 등 외부 도구에서 문자열로 enum 값 입력 가능하도록)
CREATE CAST (character varying AS "ProductCategory") WITH INOUT AS IMPLICIT;
CREATE CAST (character varying AS "Role") WITH INOUT AS IMPLICIT;
CREATE CAST (character varying AS "OrderStatus") WITH INOUT AS IMPLICIT;
