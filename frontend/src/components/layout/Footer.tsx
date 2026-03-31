export default function Footer() {
  return (
    <footer className="bg-foreground text-background/70 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} 한코두코. 정성이 담긴 핸드메이드.
        </p>
      </div>
    </footer>
  );
}
