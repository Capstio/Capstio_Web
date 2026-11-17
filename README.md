# Capstio web

Website marketing của Capstio, viết bằng Next.js (App Router, Cache Components), Tailwind CSS v4 và TypeScript.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
pnpm build
```

Next.js ở đây là phiên bản mới, khác nhiều so với bản cũ. Đọc `AGENTS.md` và tài liệu trong `node_modules/next/dist/docs/` trước khi sửa routing hoặc caching.

## Cấu trúc

- `src/app/[lang]/`: layout gốc và các trang. Mỗi ngôn ngữ có URL riêng: tiếng Việt ở gốc (`/`, `/features`), tiếng Anh dưới `/en` (`/en`, `/en/features`).
- `src/proxy.ts`: rewrite nội bộ đường dẫn không tiền tố sang `/vi/...` và chuyển `/vi/...` (308) về URL gốc. Không tự chuyển hướng theo cookie, `Accept-Language` hay IP; người dùng đổi ngôn ngữ ở header hoặc footer, trang mở lại đúng URL ở ngôn ngữ kia. Link nội bộ dùng `localizePath(lang, path)` trong `src/lib/i18n.ts`.
- `src/lib/seo.ts`: domain (`https://capstio.app`), canonical và `hreflang` (`pageAlternates`), JSON-LD của trang chủ (Organization, WebSite, SoftwareApplication). `src/app/sitemap.ts` và `src/app/robots.ts` sinh `sitemap.xml` và `robots.txt`; thêm trang vào danh sách `pages` trong `sitemap.ts` khi trang có nội dung thật. `public/llms.txt` là bản tóm tắt sản phẩm cho trợ lý AI, cần sửa khi tính năng, giá hoặc trang chính thay đổi.
- `src/lib/pricing.ts`: giá các gói (Personal 29 USD/năm, Team 8 USD/người/tháng, dùng thử 14 ngày). Khối Bảng giá trên trang chủ và JSON-LD `offers` cùng đọc từ đây; chữ hiển thị nằm ở `home.pricing` trong từ điển. Đổi giá thì sửa cả `public/llms.txt`.
- `src/dictionaries/{vi,en}.json`: toàn bộ chữ hiển thị. Tiếng Việt là ngôn ngữ chính, tiếng Anh là bản dịch đầy đủ.
- `src/lib/site-nav.ts`: cấu trúc điều hướng dùng chung cho header và footer (nhãn nằm trong từ điển).
- `src/components/ui/`: component cơ bản (Button, StatusBadge, CodeStrip, Card, Section, Container, Logo, Overline).
- `src/components/layout/`: Header (mega menu, kính khi cuộn, menu mobile), Footer, chọn ngôn ngữ, đổi giao diện.
- `src/components/home/`: các section của trang chủ. Trang là một chuyến đi: hero là cảnh biển (lúc đầu cửa sổ phim hiện trọn vẹn, biển nằm dưới; khi cuộn, cửa sổ thu nhỏ và nâng lên, biển dâng lên vào khoảng trống mà không bao giờ phủ lên phim, thuyền rời bến bên trái; từ 1024px hero được ghim trong khoảng nửa màn hình cuộn), tiếp theo 8 chặng theo thứ tự trong `src/lib/voyage.ts` (Problem, Try it, Product tour, Every tool, Trust, FAQ; chặng Every tool là dãy phím ⌘1–⌘0 trong `tool-keys.tsx`, có thuyền lướt tới phím đang chọn), cuối cùng là bến cảng `#harbor` trong `final-cta.tsx` (tời trên bến bên phải kéo thuyền vào, kèm câu chuyện tên Capstio và CTA tải app). Biển dùng chung `wave-divider.tsx` (`SeaLayers`), thuyền dùng chung `voyage-boat.tsx`. Ảnh chụp app thật (Apps, Config, Fleet) nằm ở `public/features/` và chỉ hiện trong Product tour.
- Khối tương tác của trang chủ: `try-it.tsx` gom hai console có tab, `CommandConsole` trong `command-equivalent.tsx` (lệnh tương đương, dữ liệu ở `src/lib/commands.ts`) và `DangerConsole` trong `danger-demo.tsx` (mô phỏng lệnh nguy hiểm, quy tắc ở `src/lib/command-risk.ts`, chỉ để minh hoạ, không phải quy tắc của app); `get-started.tsx` gom `ssh-import.tsx` (đọc `~/.ssh/config` ngay trong trình duyệt bằng `src/lib/ssh-config.ts`, không gửi đi đâu) và `latest-release.tsx` (bản phát hành mới nhất từ GitHub, cache 1 giờ trong `src/lib/releases.ts`; chưa có bản nào thì hiện "sắp ra mắt"); `product-tour.tsx` và `try-it.tsx` dùng tab theo chuẩn WAI-ARIA. Bảng lệnh ⌘K ở `src/components/layout/command-palette.tsx` nhảy tới các chặng trong `src/lib/voyage.ts`, nên chặng mới cần `id`, một dòng trong `voyage.ts` và một dòng trong `palette.sections` của từ điển.
- Trang con (không phải trang chủ): mỗi route một thư mục trong `src/app/[lang]/` (pricing, faq, security, compare, release-notes, features và `features/[feature]`, download; trang chưa viết như solutions, technology, insights, about, brand, privacy, terms dùng `ComingSoon`, có `noindex`). Chữ của từng trang nằm trong file riêng `src/dictionaries/pages/<trang>.{vi,en}.json`, đọc bằng `getPageCopy` (`src/lib/dictionaries.ts`); chữ dùng chung (menu, footer, trang chủ) vẫn ở `src/dictionaries/{vi,en}.json`. `src/lib/pages.ts` là danh sách mọi route: trang thật (`"page"`) vào `sitemap.xml`, trang sắp có (`"soon"`) thì không. Khung trang con là `src/components/page/page-shell.tsx` (breadcrumb, một H1, CTA tải app, chạy `PageMotion`); metadata dùng `pageMetadata` và schema dùng `breadcrumbJsonLd`/`faqPageJsonLd`/`softwareApplicationJsonLd` trong `src/lib/seo.ts`. Thêm trang mới: thêm route, file chữ, một dòng trong `pages.ts` và nếu cần một mục trong `src/lib/site-nav.ts`. Không export `dynamicParams` trong route (cấu hình `cacheComponents` không cho phép); slug sai trả 404 bằng tra cứu và `notFound()`.
- `src/components/motion/page-motion.tsx`: animation của trang bằng anime.js v4. Section chỉ cần gắn thuộc tính: `data-reveal` (các phần tử con lần lượt hiện khi cuộn tới), `data-reveal-self` (chính phần tử đó hiện), `data-split` + `data-word` (headline hiện theo chữ), `code[data-type]` (chip lệnh tự gõ), `data-keys` (phím ⌘ nhấn lần lượt), `data-pill` (pill thông báo ở hero: gõ lệnh rồi hiện kết quả), `data-boat` (thuyền cưỡi sóng: mỗi khung hình đọc vị trí sóng thật nên luôn nằm trên mặt nước; ở hero thuyền đi theo cuộn, ở `#harbor` tời kéo thuyền vào bến) và `data-page-capstan` (tời nhỏ ở mép phải, cuộn dây theo tiến độ đọc trang, bản thu gọn từ 1280px; màn hình hẹp hơn chỉ còn thanh tiến độ ở đỉnh trang với chiếc neo chạy theo; component ở `src/components/home/page-capstan.tsx`). Đặt `<PageMotion />` ở cuối mỗi page, không đặt trong layout, để animation chỉ chạy khi nội dung đã hydrate. Trạng thái ẩn ban đầu và cơ chế dự phòng khi không có JS nằm ở cuối `globals.css`; người dùng bật reduced motion sẽ không thấy animation.
- `public/brand/`: logo lấy từ bộ brand của app macOS (`../macos/docs/brand/logo`).

## Design token

Nguồn là mục Foundations trong file Figma Capstio. Toàn bộ nằm ở `src/app/globals.css`, chia ba lớp:

1. **Primitives** trong `@theme`: neutral, blue, mint, slate và các bậc trạng thái. Trang không dùng trực tiếp.
2. **Semantic**: biến theo vai trò (`--bg-page`, `--text-body`, `--action-primary`...), đổi theo giao diện sáng hoặc tối. Dùng qua utility ngắn như `bg-page`, `text-heading`, `border-line`, `bg-action`.
3. **Context**: khối trang chọn một ngữ cảnh bằng `data-surface="light|subtle|dark"` (component `Section`). Khối `dark` luôn giữ màu tối ở cả hai giao diện.

Kiểu chữ dùng utility `type-display`, `type-h1`...`type-mono-s` (cỡ mobile và desktop theo Figma). Font là Inter (Latin, Vietnamese, Cyrillic, Greek) và JetBrains Mono, nạp bằng `next/font`. Thang khoảng cách dùng thang 4px mặc định của Tailwind, khớp với Figma. Container nội dung 1200px, dùng class `container-page`.

Giao diện tối bật bằng class `dark` trên `<html>`, lưu ở `localStorage` (`capstio-theme`) và áp trước lần vẽ đầu để không bị nháy.
