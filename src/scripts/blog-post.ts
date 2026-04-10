// Wrap in ready() to handle both deferred and inline execution contexts
function ready(fn: () => void) {
	if (document.readyState !== 'loading') fn();
	else document.addEventListener('DOMContentLoaded', fn);
}

// Highlight parenthetical text: (like this) → <span class="parenthetical">
ready(() => {
	const prose = document.querySelector('.prose');
	if (!prose) return;

	const walker = document.createTreeWalker(
		prose,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode(node) {
				if ((node as Text).parentElement?.closest('code, pre, a, h1, h2, h3, h4')) {
					return NodeFilter.FILTER_REJECT;
				}
				return node.textContent?.includes('(')
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		}
	);

	const nodes: Node[] = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);

	nodes.forEach((node) => {
		const wrapper = document.createElement('span');
		wrapper.innerHTML = (node.textContent ?? '').replace(
			/\(([^)]+)\)/g,
			'<span class="parenthetical">($1)</span>'
		);
		node.parentNode?.replaceChild(wrapper, node);
	});
});

// Table of contents — floating, auto-generated from h2s, shown only if 3+
ready(() => {
	const prose = document.querySelector('.prose');
	const container = document.getElementById('toc-container');
	const nav = document.getElementById('toc-nav');
	if (!prose || !container || !nav) return;

	const headings = Array.from(prose.querySelectorAll('h2')) as HTMLElement[];
	if (headings.length < 3) return;

	headings.forEach((h, i) => {
		if (!h.id) h.id = 'section-' + i;
		const a = document.createElement('a');
		a.href = '#' + h.id;
		a.textContent = h.textContent ?? '';
		a.className = 'toc-link';
		a.dataset.target = h.id;
		nav.appendChild(a);
	});

	container.style.display = 'block';

	const links = Array.from(nav.querySelectorAll('.toc-link')) as HTMLElement[];
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				links.forEach(l => l.classList.remove('toc-active'));
				const active = links.find(l => l.dataset.target === (entry.target as HTMLElement).id);
				if (active) active.classList.add('toc-active');
			}
		});
	}, { rootMargin: '0px 0px -60% 0px' });

	headings.forEach(h => observer.observe(h));

	const sentinel = document.querySelector('.related') ?? document.querySelector('.share-section');
	if (sentinel) {
		const threshold = (sentinel as HTMLElement).offsetTop - window.innerHeight * 0.5;
		function updateTocVisibility() {
			const past = window.scrollY >= threshold;
			container!.style.opacity = past ? '0' : '1';
			container!.style.pointerEvents = past ? 'none' : 'auto';
		}
		window.addEventListener('scroll', updateTocVisibility, { passive: true });
		updateTocVisibility();
	}
});

// Reading progress bar
ready(() => {
	const bar = document.getElementById('progress-bar');
	if (!bar) return;
	window.addEventListener('scroll', () => {
		const doc = document.documentElement;
		const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
		bar.style.width = pct + '%';
	}, { passive: true });
});

// Share on X
ready(() => {
	const shareX = document.getElementById('share-x') as HTMLAnchorElement | null;
	if (!shareX) return;
	const text = 'Found this on Crossing Dreams ✨ ' + document.title;
	shareX.href =
		'https://twitter.com/intent/tweet?url=' +
		encodeURIComponent(window.location.href) +
		'&text=' +
		encodeURIComponent(text);
});

// Copy link
ready(() => {
	const copyBtn = document.getElementById('copy-link');
	if (!copyBtn) return;
	copyBtn.addEventListener('click', () => {
		navigator.clipboard.writeText(window.location.href).then(() => {
			const orig = copyBtn.textContent;
			copyBtn.textContent = 'copied!';
			setTimeout(() => { copyBtn.textContent = orig; }, 2000);
		});
	});
});
