import { paletteItems } from '../../data/paletteItems.js';
import useTranslation from '../../../../shared/translation/useTranslation.js';
import useTheme from '../../../../shared/theme/useTheme.js';

import EmptyPreview from './previews/EmptyPreview.jsx';
import LiveChart from './previews/LiveChart.jsx';
import LiveMetric from './previews/LiveMetric.jsx';
import LiveProgress from './previews/LiveProgress.jsx';
import LiveText from './previews/LiveText.jsx';
import LiveFilter from './previews/LiveFilter.jsx';
import LiveDataControl from './previews/LiveDataControl.jsx';
import LivePageLink from './previews/LivePageLink.jsx';
import LiveTable from './previews/LiveTable.jsx';


const previewThemes = {
    light: {
        background: '#ffffff',
        foreground: '#342f2b',
        muted: '#766d66',
        border: '#dee2e6',
        grid: '#e5e9ed',
        tooltip: 'rgba(255, 255, 255, 0.98)',
        tooltipShadow: '0 12px 30px rgba(52, 58, 64, 0.12)',
    },
    dark: {
        background: '#181614',
        foreground: '#e5ddd8',
        muted: '#b2a49d',
        border: '#39332e',
        grid: '#332f2c',
        tooltip: 'rgba(31, 28, 26, 0.97)',
        tooltipShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
    },
};

const LiveComponentPreview = (props) => {
    const { item, height } = props;
    const { t, language } = useTranslation();
    const { theme: activeTheme } = useTheme();
    const theme = previewThemes[activeTheme] || previewThemes.light;

    if (paletteItems[item.type]?.isChart) {
        return <LiveChart item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'metric') {
        return <LiveMetric item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'progress') {
        return <LiveProgress item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'text') {
        return <LiveText item={item} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'selectbox') {
        return <LiveFilter {...props} t={t} language={language} theme={theme} />;
    }
    if (item.type === 'data_control') {
        return <LiveDataControl {...props} t={t} theme={theme} />;
    }
    if (item.type === 'page_link') {
        return <LivePageLink item={item} height={height} t={t} />;
    }
    if (item.type === 'table') {
        return <LiveTable item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }

    return <EmptyPreview theme={theme}>{t('editor.unknownComponent')}</EmptyPreview>;
};

export default LiveComponentPreview;
