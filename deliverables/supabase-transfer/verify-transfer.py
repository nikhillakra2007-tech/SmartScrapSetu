"""Verify a migrated database using psql; passwords stay in libpq configuration.

Run with --host, --port, --user, --dbname after confirming the destination.
Reads the ignored private source snapshot. Never prints source records.
"""
import argparse
import json
import os
import pathlib
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--psql', default='psql')
parser.add_argument('--host', required=True)
parser.add_argument('--port', default='5432')
parser.add_argument('--user', required=True)
parser.add_argument('--dbname', default='postgres')
args = parser.parse_args()
os.environ['PGOPTIONS'] = '-c timezone=UTC'
base = pathlib.Path(__file__).resolve().parent
snapshot = json.loads((base / 'private/source-snapshot.json').read_text(encoding='utf-8'))
cmd = [args.psql, '-X', '-h', args.host, '-p', args.port, '-U', args.user, '-d', args.dbname, '-v', 'ON_ERROR_STOP=1', '-At']

def query(sql):
    result = subprocess.run(cmd + ['-c', sql], capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise RuntimeError('Database verification query failed: ' + result.stderr)
    return result.stdout.strip()

def scalar(sql):
    return int(query(sql))

keymap = {
    ('METAL_SCRAP', 'copper_scrap'): ('METAL_NONFERROUS', 'copper'),
    ('METAL_SCRAP', 'aluminium_scrap'): ('METAL_NONFERROUS', 'aluminium'),
    ('METAL_SCRAP', 'iron_steel_scrap'): ('METAL_FERROUS', 'iron'),
}
checked = 0
for table, original in snapshot['data'].items():
    columns = [c['name'] for c in snapshot['columns'] if c['table_name'] == table]
    selected = ','.join('"' + c + '"' for c in columns)
    current = json.loads(query(f"SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]') FROM (SELECT {selected} FROM public.\"{table}\") t"))
    expected = []
    for source in original:
        row = source.copy()
        oldkey = (row.get('parent_code'), row.get('sub_code'))
        if table == 'material_categories' and oldkey == ('METAL_SCRAP', 'mixed_metal_casing'):
            saved = json.loads(query("SELECT source_record FROM public.material_classification_review WHERE source_parent_code='METAL_SCRAP' AND source_sub_code='mixed_metal_casing'"))
            assert saved == source, 'Review record changed'
            checked += 1
            continue
        if oldkey in keymap:
            row['parent_code'], row['sub_code'] = keymap[oldkey]
            if table == 'material_categories':
                row['parent_name'] = 'Non-Ferrous Metal' if row['parent_code'] == 'METAL_NONFERROUS' else 'Ferrous Metal'
        if table == 'material_categories' and row['parent_code'] == 'PLASTIC':
            row['parent_name'] = 'Plastic'
        expected.append(row)
    if table != 'material_categories':
        assert len(current) == len(expected), f'{table}: row-count mismatch'
    for row in expected:
        assert row in current, f'{table}: source record not preserved'
        checked += 1

assert checked == 105
assert scalar('SELECT count(*) FROM public.material_groups') == 8
assert scalar("SELECT count(DISTINCT parent_code) FROM public.material_categories WHERE group_code='E_WASTE'") == 9
assert scalar("SELECT count(*) FROM public.material_categories WHERE parent_code='METAL_SCRAP' OR (group_code='E_WASTE' AND parent_code='PLASTIC')") == 0
assert scalar("SELECT count(*) FROM public.material_categories WHERE group_code<>'E_WASTE' AND epr_schedule1_hint IS NOT NULL") == 0
assert scalar("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity") == 0
assert scalar("SELECT count(*) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND NOT convalidated") == 0
assert scalar('SELECT count(*) FROM auth.users') == 0
assert scalar('SELECT count(*) FROM storage.buckets') == 4
assert scalar("SELECT count(*) FROM public.price_history WHERE parent_code='METAL_NONFERROUS' AND sub_code='copper'") == 2
query('SELECT * FROM public.fn_match_recyclers_for_lot((SELECT id FROM public.lots LIMIT 1),5)')
result = subprocess.run(cmd + ['-f', str(base / 'verify-constraints.sql')], capture_output=True, text=True, encoding='utf-8')
if result.returncode:
    raise RuntimeError('Constraint tests failed: ' + result.stderr)
print(json.dumps({'status': 'passed', 'source_records_preserved': checked, 'source_tables': 17, 'material_groups': 8, 'ewaste_parent_categories': 9, 'catalog_entries': scalar('SELECT count(*) FROM public.material_categories'), 'foreign_keys': scalar("SELECT count(*) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND contype='f'"), 'constraint_and_access_tests': 'passed'}, indent=2))
