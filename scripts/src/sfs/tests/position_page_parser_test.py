import importlib.resources
import unittest
from decimal import Decimal
import sfs.tests.pages
from sfs.core import PositionPageParser

from sfs.core.position_page_parser import StampBaseInfo


class TestPositionPageParsing(unittest.TestCase):
    answers = {
        "38182.html": [
            StampBaseInfo(id=2741,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/3ddc8c24-ad54-401a-9adb-45bab3b7e2d5.jpg',
                          series='Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации',
                          name='Ирис кожистый (Iris scariosa)',
                          value=Decimal('56.00'), year=2021, present=True),
            StampBaseInfo(id=2742,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/f69e1f60-b22c-4d5e-b20f-47f6b687ff1f.jpg',
                          series='Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации',
                          name='Ирис Воробьёва (Iris vorobievii)',
                          value=Decimal('56.00'), year=2021, present=True),
            StampBaseInfo(id=2743,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/0176da66-118b-4e7b-b709-22e51b51708c.jpg',
                          series='Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации',
                          name='Ирис остродольный (Iris acutiloba)',
                          value=Decimal('56.00'), year=2021, present=True),
            StampBaseInfo(id=2744,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/71656420-405f-4a02-88c8-b3893abf7286.jpg',
                          series='Флора России. Цветы. Ирисы, занесённые в Красную книгу Российской Федерации',
                          name='Ирис тигровый (Iris tigridia)',
                          value=Decimal('56.00'), year=2021, present=True)],
        "38205.html": [
            StampBaseInfo(id=2746,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/be0c530e-36f1-429f-b712-3251d8553d11.jpg',
                          series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
                          name='Федоскинская лаковая миниатюра. "Жар-птица"',
                          value=Decimal('30.00'), year=2021, present=True),
            StampBaseInfo(id=2747,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/510e3792-4401-4b9d-9657-6f702ccbba71.jpg',
                          series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
                          name='Федоскинская лаковая миниатюра. "Иван- да- Марья".',
                          value=Decimal('30.00'), year=2021, present=True),
            StampBaseInfo(id=2748,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/788ba7c7-8531-4e0a-a13a-85af4a4ff22c.jpg',
                          series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
                          name='Федоскинская лаковая миниатюра. "Руслан и Людмила"',
                          value=Decimal('30.00'), year=2021, present=True),
            StampBaseInfo(id=2749,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/571c1b18-c686-42f8-a0b5-ba9520785d0d.jpg',
                          series='Серия "Декоративно-прикладное искусство России. Федоскинская лаковая миниатюра"',
                          name='Федоскинская лаковая миниатюра. "Чаепитие"',
                          value=Decimal('30.00'), year=2021, present=True)],
        "38226.html": [
            StampBaseInfo(id=2753,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/27aa6075-9c46-460e-9bec-61e30aa55fe5.jpg',
                          name='Федеральная служба войск национальной гвардии Российской Федерациии',
                          value=Decimal('100.00'), year=2021, present=True)
        ],
        "38617.html": [
            StampBaseInfo(id=2791,
                          image_url='https://rusmarka.ru//files/sitedata/401/1439/c881a21b-efc4-42a1-9be2-a10d70ce2436.jpg',
                          name='2550 лет городу Феодосии',
                          value=None, year=2021, present=False)
        ]
    }

    def test_parse_stamp_base_info(self):
        for resource in TestPositionPageParsing.answers:
            content = importlib.resources.read_binary(sfs.tests.pages, resource)
            # print("===================")
            # for section in PositionPageParser.parse_sections(content):
            #    print(section)
            entries = PositionPageParser.parse_stamp_entries(content)
            self.assertEqual(entries, TestPositionPageParsing.answers[resource])


if __name__ == '__main__':
    unittest.main()
