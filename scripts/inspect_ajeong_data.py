"""NEXT SPOT 대회 당일 원본 파일 점검기: CSV와 기본 XLSX 형식을 읽기 전용으로 검사합니다."""
import argparse, csv, json, re, sys, zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

def read_csv(path):
    for encoding in ('utf-8-sig', 'cp949', 'utf-8'):
        try:
            with open(path, encoding=encoding, newline='') as f:
                return list(csv.DictReader(f))
        except UnicodeDecodeError:
            continue
    raise ValueError('CSV 인코딩을 읽지 못했습니다.')

def read_xlsx(path):
    ns = {'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            shared = [''.join(node.itertext()) for node in root.findall('x:si', ns)]
        sheet = next(name for name in z.namelist() if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'))
        rows = []
        for row in ET.fromstring(z.read(sheet)).findall('.//x:row', ns):
            values = []
            for cell in row.findall('x:c', ns):
                value = cell.findtext('x:v', default='', namespaces=ns)
                values.append(shared[int(value)] if cell.get('t') == 's' and value else value)
            rows.append(values)
    headers = [str(value).strip() for value in rows[0]]
    return [dict(zip(headers, values + [''] * (len(headers) - len(values)))) for values in rows[1:]]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='NEXT SPOT 원본 파일 구조 점검')
    parser.add_argument('file', help='CSV 또는 XLSX 파일 경로')
    args = parser.parse_args()
    path = Path(args.file)
    rows = read_csv(path) if path.suffix.lower() == '.csv' else read_xlsx(path) if path.suffix.lower() == '.xlsx' else sys.exit('CSV 또는 XLSX만 지원합니다.')
    columns = list(rows[0]) if rows else []
    date_re = re.compile(r'^\d{4}[-/.]?\d{1,2}([-/\.]?\d{1,2})?$')
    region_re = re.compile(r'[가-힣].*(시|군|구|동|읍|면|리)$')
    profiles = []
    for column in columns:
        values = [row.get(column, '') for row in rows]
        nonempty = [str(value).strip() for value in values if str(value).strip()]
        profiles.append({'column': column, 'sampleValues': nonempty[:3], 'missingCount': len(values)-len(nonempty), 'dateLikeSamples': sum(bool(date_re.match(value)) for value in nonempty[:20]), 'regionLikeSamples': sum(bool(region_re.match(value)) for value in nonempty[:20])})
    print(json.dumps({'fileName':path.name,'rowCount':len(rows),'columns':columns,'columnProfiles':profiles,'candidateColumns':{'date':[p['column'] for p in profiles if p['dateLikeSamples']>=2],'region':[p['column'] for p in profiles if p['regionLikeSamples']>=2]},'nextStep':'후보 컬럼은 자동 mapping되지 않습니다. 팀이 확인한 mapping을 realDataMapping.json에 작성하세요.'}, ensure_ascii=False, indent=2))
