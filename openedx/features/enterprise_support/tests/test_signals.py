"""Tests of email marketing signal handlers."""
import logging
import ddt
from django.contrib.sites.models import Site
from django.test import TestCase
from django.test.client import RequestFactory
from mock import patch

from email_marketing.models import EmailMarketingConfiguration  # pylint: disable=import-error
from student.tests.factories import UserFactory
from openedx.features.enterprise_support.tests.factories import EnterpriseCustomerFactory, EnterpriseCustomerUserFactory
from openedx.features.enterprise_support.signals import update_email_marketing_user_with_enterprise_flag

log = logging.getLogger(__name__)

LOGGER_NAME = "enterprise_support.signals"

TEST_EMAIL = "test@edx.org"


def update_email_marketing_config(enabled=True, key='badkey', secret='badsecret', new_user_list='new list',
                                  template='Welcome', enroll_cost=100, lms_url_override='http://testserver'):
    """
    Enable / Disable Sailthru integration
    """
    return EmailMarketingConfiguration.objects.create(
        enabled=enabled,
        sailthru_key=key,
        sailthru_secret=secret,
        sailthru_new_user_list=new_user_list,
        sailthru_welcome_template=template,
        sailthru_enroll_template='enroll_template',
        sailthru_lms_url_override=lms_url_override,
        sailthru_get_tags_from_sailthru=False,
        sailthru_enroll_cost=enroll_cost,
        sailthru_max_retries=0,
        welcome_email_send_delay=600
    )


@ddt.ddt
class EnterpriseSupportSignals(TestCase):
    """
    Tests for the enterprise support signals.
    """

    def setUp(self):
        update_email_marketing_config(enabled=False)
        self.request_factory = RequestFactory()
        self.user = UserFactory.create(username='test', email=TEST_EMAIL)
        self.request = self.request_factory.get("foo")
        update_email_marketing_config(enabled=True)

        self.site = Site.objects.get_current()
        self.site_domain = self.site.domain
        self.request.site = self.site
        super(EnterpriseSupportSignals, self).setUp()

    @patch('openedx.features.enterprise_support.signals.update_user.delay')
    def test_register_user(self, mock_update_user):
        """
        make sure marketing enterprise user call invokes update_user
        """
        enterprise_customer = EnterpriseCustomerFactory()
        enterprise_customer_user = EnterpriseCustomerUserFactory(
            user_id=self.user.id,
            enterprise_customer=enterprise_customer
        )
        update_email_marketing_user_with_enterprise_flag(None, instance=enterprise_customer_user)
        self.assertTrue(mock_update_user.called)
