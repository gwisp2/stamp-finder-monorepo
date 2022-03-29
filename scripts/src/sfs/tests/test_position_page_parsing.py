import importlib.resources
from decimal import Decimal
from typing import Dict, List

import pytest

import sfs.tests.pages
from sfs.core import PositionPageParser, StampBaseInfo

expected_values_dict: Dict[str, List[StampBaseInfo]] = {
    "38182.html": [
        StampBaseInfo(
            id=2741,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/3ddc8c24-ad54-401a-9adb-45bab3b7e2d5.jpg",
            series="Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации",
            name="Ирис кожистый (Iris scariosa)",
            value=Decimal("56.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2742,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/f69e1f60-b22c-4d5e-b20f-47f6b687ff1f.jpg",
            series="Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации",
            name="Ирис Воробьёва (Iris vorobievii)",
            value=Decimal("56.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2743,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/0176da66-118b-4e7b-b709-22e51b51708c.jpg",
            series="Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации",
            name="Ирис остродольный (Iris acutiloba)",
            value=Decimal("56.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2744,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/71656420-405f-4a02-88c8-b3893abf7286.jpg",
            series="Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации",
            name="Ирис тигровый (Iris tigridia)",
            value=Decimal("56.00"),
            year=2021,
            present=True,
        ),
    ],
    "38205.html": [
        StampBaseInfo(
            id=2746,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/be0c530e-36f1-429f-b712-3251d8553d11.jpg",
            series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
            name='Федоскинская лаковая миниатюра. "Жар-птица"',
            value=Decimal("30.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2747,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/510e3792-4401-4b9d-9657-6f702ccbba71.jpg",
            series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
            name='Федоскинская лаковая миниатюра. "Иван- да- Марья".',
            value=Decimal("30.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2748,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/788ba7c7-8531-4e0a-a13a-85af4a4ff22c.jpg",
            series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
            name='Федоскинская лаковая миниатюра. "Руслан и Людмила"',
            value=Decimal("30.00"),
            year=2021,
            present=True,
        ),
        StampBaseInfo(
            id=2749,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/571c1b18-c686-42f8-a0b5-ba9520785d0d.jpg",
            series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
            name='Федоскинская лаковая миниатюра. "Чаепитие"',
            value=Decimal("30.00"),
            year=2021,
            present=True,
        ),
    ],
    "38226.html": [
        StampBaseInfo(
            id=2753,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/27aa6075-9c46-460e-9bec-61e30aa55fe5.jpg",
            name="Федеральная служба войск национальной гвардии Российской Федерациии",
            value=Decimal("100.00"),
            year=2021,
            present=True,
        )
    ],
    "38617.html": [
        StampBaseInfo(
            id=2791,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/c881a21b-efc4-42a1-9be2-a10d70ce2436.jpg",
            name="2550 лет городу Феодосии",
            value=None,
            year=2021,
            present=False,
        )
    ],
    "38063.html": [
        StampBaseInfo(
            id=2726,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/5154d87f-7a50-4c48-9900-6bf47808161a.jpg",
            value=None,
            year=2021,
            series='Серия "Государственные награды Российской Федерации. Медали"',
            name="«За отличие в охране общественного порядка»",
            present=False,
        ),
        StampBaseInfo(
            id=2727,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/cd782a2e-41ad-45ce-af53-853237e042dd.jpg",
            value=None,
            year=2021,
            series='Серия "Государственные награды Российской Федерации. Медали"',
            name="«За отличие в охране государственной границы»",
            present=False,
        ),
        StampBaseInfo(
            id=2728,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/96432951-0c07-4b66-a555-d4704b9849c3.jpg",
            value=None,
            year=2021,
            series='Серия "Государственные награды Российской Федерации. Медали"',
            name="«За отвагу на пожаре»",
            present=False,
        ),
        StampBaseInfo(
            id=2729,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/39af6a9e-d5e8-4918-b6b8-6da4ab4cf64d.jpg",
            value=None,
            year=2021,
            series='Серия "Государственные награды Российской Федерации. Медали"',
            name="«За спасение погибавших»",
            present=False,
        ),
    ],
    "39566.html": [
        StampBaseInfo(
            id=2881,
            image_url="https://rusmarka.ru//files/sitedata/401/1439/736bbf1f-bfb3-45eb-b6f7-3bb9bc564f0d.jpg",
            value=Decimal("50.00"),
            year=2022,
            series=None,
            name='Учебное парусное судно "Херсонес"',
            present=True,
        )
    ],
}
page_name_list = [k for k, v in expected_values_dict.items()]


@pytest.mark.parametrize("page_name", page_name_list)
def test_parse_stamp_info(page_name: str):
    content = importlib.resources.read_binary(sfs.tests.pages, page_name)
    print("===================")
    for section in PositionPageParser.parse_sections(content):
        print(section)
    entries = PositionPageParser.parse_stamp_entries(content)
    assert entries == expected_values_dict[page_name]
