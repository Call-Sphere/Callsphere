import theme1 from '../Themes/bnw';
import deepocean from '../Themes/deepocean';

const Themes = new Map<string, Theme>();

Themes.set('default', { CSS: {}, name: 'Défaut' });
Themes.set('deepocean', { CSS: deepocean, name: 'Océan profond' });
Themes.set('bnw', { CSS: theme1, name: 'Noir et blanc' });

function getThemes() {
	return Array.from(Themes, ([name, value]) => ({ name, value }));
}

function getTheme(themeId: string) {
	return Themes.get(themeId);
}

function ThemeProvider({ themeId, children }: { themeId: string; children: JSX.Element | JSX.Element[] }) {
	return (
		<div className="ThemeProvider" style={Themes.get(themeId)?.CSS}>
			{children}
		</div>
	);
}

export default ThemeProvider;
export { getThemes, getTheme };
