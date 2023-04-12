## Tài liệu (Documents):

> https://documents.aptech.io/docs/category/c-backend-with-nodejs


ExtractJwt.fromAuthHeaderAsBearerToken()
ExtractJwt.fromUrlQueryParameter('access_token')
ExtractJwt.fromHeader('x-access-token')

section: false => môi trường hd là API

TÁCH RỜI TRANG TẠO VÀ TRANG DANH SÁCH
TRONG ĐÓ:
- KHI TẠO MỚI SẢN PHẨM THÀNH CÔNG => ĐIỀU HƯỚNG ĐẾN TRANG DANH SÁCH SẢN PHẨM
- Ở TRANG DANH SÁCH
  1. PHÂN TRANG 10 KẾT QUẢ / TRANG
  2. BỘ LỌC TÌM KIẾM THEO TÊN SẢN PHẨM => NGƯỜI DÙNG NHẬP TÊN BẤT KÌ
  3. BỘ LỌC TÌM KIẾM THEO NHÀ CUNG CẤP => NGƯỜI DÙNG CLICK ĐỂ LỰA CHỌN CÁC NHÀ CUNG CẤP TRONG DANH SÁCH
  4. BỘ LỌC TÌM KIẾM THEO DANH MỤC SẢN PHẨM => NGƯỜI DÙNG CLICK ĐỂ LỰA CHỌN DANH MỤC SẢN PHẨM
  5. BỘ LỌC TÌM KIẾM TỒN KHO, GIÁ BÁN VÀ GIẢM GIÁ: GIỚI HẠN GIÁ TRỊ THẤP NHẤT VÀ CAO NHẤT. NẾU KHÔNG GIỚI HẠN THẤP NHẤT THÌ TÌM TẤT CẢ < GIỚI HẠN CAO NHẤT, NGƯỢC LẠI SẼ TÌM > GIỚI HẠN THẤP NHẤT.

  VD: NHẬP 100.000 VÀO Ô GIÁ NHỎ NHẤT ĐỂ TÌM KIẾM => TRẢ VỀ CÁC SẢN PHẨM CÓ GIÁ TỪ 100.000 
  VD: NHẬP 100.000 VÀO Ô GIÁ LỚN NHẤT ĐỂ TÌM KIẾM => TRẢ VỀ CÁC SẢN PHẨM CÓ GIÁ TỪ 0 ĐẾN 100.000 
  VD: NHẬP 100.000 VÀO Ô GIÁ NHỎ NHẤT , 500.000 VÀO Ô GIÁ LỚN NHẤT ĐỂ TÌM KIẾM => TRẢ VỀ CÁC SẢN PHẨM CÓ GIÁ TỪ 100.000 ĐẾN 500.000 
  VD: KHÔNG NHẬP => TÌM THEO TẤT CẢ GIÁ.
