const pathname = "/some/path\nFake Log: Unauthorized access";
const safePathname = pathname.replace(/[\r\n]+/g, "");
console.log(pathname);
console.log(safePathname);
