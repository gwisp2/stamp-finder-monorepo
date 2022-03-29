import importlib.resources
import unittest
from decimal import Decimal

import sfs.tests.pages
from sfs.core.data_fetch import extract_buy_offers
from sfs.core.data_fetch import BuyOffer


class TestBuyOffersParsing(unittest.TestCase):
    answers = {
        "38182.html": [
            BuyOffer(stamp_ids=[2741], typ="Чистый", price=Decimal("56.00")),
            BuyOffer(stamp_ids=[2742], typ="Чистый", price=Decimal("56.00")),
            BuyOffer(stamp_ids=[2743], typ="Чистый", price=Decimal("56.00")),
            BuyOffer(stamp_ids=[2743], typ="Гашеный", price=Decimal("17.00")),
            BuyOffer(stamp_ids=[2744], typ="Чистый", price=Decimal("56.00")),
            BuyOffer(stamp_ids=[2744], typ="Гашеный", price=Decimal("17.00")),
            BuyOffer(
                stamp_ids=[2741, 2742, 2743, 2744],
                typ="Чистый",
                price=Decimal("448.00"),
            ),
        ],
        "38205.html": [
            BuyOffer(stamp_ids=[2746], typ="Чистый", price=Decimal("30.00")),
            BuyOffer(stamp_ids=[2746], typ="Чистый", price=Decimal("360.00")),
            BuyOffer(stamp_ids=[2747], typ="Чистый", price=Decimal("30.00")),
            BuyOffer(stamp_ids=[2747], typ="Гашеный", price=Decimal("11.00")),
            BuyOffer(stamp_ids=[2747], typ="Чистый", price=Decimal("360.00")),
            BuyOffer(stamp_ids=[2748], typ="Чистый", price=Decimal("30.00")),
            BuyOffer(stamp_ids=[2748], typ="Гашеный", price=Decimal("11.00")),
            BuyOffer(stamp_ids=[2748], typ="Чистый", price=Decimal("360.00")),
            BuyOffer(stamp_ids=[2749], typ="Чистый", price=Decimal("30.00")),
            BuyOffer(stamp_ids=[2749], typ="Гашеный", price=Decimal("11.00")),
            BuyOffer(stamp_ids=[2749], typ="Чистый", price=Decimal("360.00")),
        ],
        "38226.html": [
            BuyOffer(stamp_ids=[2753], typ="Чистый", price=Decimal("100.00")),
            BuyOffer(stamp_ids=[2753], typ="Гашеный", price=Decimal("73.00")),
        ],
        "38617.html": [],
        "38063.html": [
            BuyOffer(stamp_ids=[2726], typ="Гашеный", price=Decimal("24.00")),
            BuyOffer(stamp_ids=[2727], typ="Гашеный", price=Decimal("24.00")),
            BuyOffer(stamp_ids=[2728], typ="Гашеный", price=Decimal("24.00")),
            BuyOffer(stamp_ids=[2729], typ="Гашеный", price=Decimal("24.00")),
        ],
        "39566.html": [
            BuyOffer(stamp_ids=[2881], typ="Чистый", price=Decimal("50.00")),
            BuyOffer(stamp_ids=[2881], typ="Гашеный", price=Decimal("17.00")),
            BuyOffer(stamp_ids=[2881], typ="Чистый", price=Decimal("350.00")),
        ],
    }

    def test_parse_stamp_base_info(self):
        for resource in self.answers:
            content = importlib.resources.read_binary(sfs.tests.pages, resource)
            buy_offers = extract_buy_offers(content)
            self.assertEqual(buy_offers, self.answers[resource])


if __name__ == "__main__":
    unittest.main()
