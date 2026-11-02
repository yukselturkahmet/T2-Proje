import styled from 'styled-components';
import { t } from '../theme/tokens';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;

  th {
    text-align: left;
    font-size: 13px;
    font-weight: 500;
    color: ${t.textMuted};
    padding: 16px 20px;
    border-bottom: 1px solid ${t.line};
    white-space: nowrap;
  }
  td {
    padding: 18px 20px;
    border-bottom: 1px solid ${t.line};
    vertical-align: top;
  }
  tbody tr:last-child td { border-bottom: 0; }
  td strong { color: ${t.text}; font-weight: 500; }
  td:first-child { min-width: 150px; }
  td small { display: block; margin-top: 4px; color: ${t.textMuted}; font-size: 13px; line-height: 1.45; }
  .num { font-variant-numeric: tabular-nums; white-space: nowrap; }
`;
