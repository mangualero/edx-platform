"""Test Entitlements models"""

import unittest
from datetime import datetime, timedelta

import pytz
from django.conf import settings
from django.test import TestCase

from openedx.core.djangoapps.content.course_overviews.tests.factories import CourseOverviewFactory
from student.tests.factories import CourseEnrollmentFactory

# Entitlements is not in CMS' INSTALLED_APPS so these imports will error during test collection
if settings.ROOT_URLCONF == 'lms.urls':
    from entitlements.tests.factories import CourseEntitlementFactory


@unittest.skipUnless(settings.ROOT_URLCONF == 'lms.urls', 'Test only valid in lms')
class TestModels(TestCase):
    """Test entitlement with policy model functions."""

    def setUp(self):
        super(TestModels, self).setUp()
        self.course = CourseOverviewFactory.create(
            start=datetime.utcnow()
        )
        self.enrollment = CourseEnrollmentFactory.create(course_id=self.course.id)

    def test_is_entitlement_redeemable(self):
        """
        Test that the entitlement is not expired when created now, and is expired when created two years
        ago with a policy that sets the expiration period to 450 days
        """

        entitlement = CourseEntitlementFactory.create()

        assert entitlement.is_entitlement_redeemable() is True

        # Create a date 2 years in the past (greater than the policy expire period of 450 days)
        past_datetime = datetime.utcnow().replace(tzinfo=pytz.UTC) - timedelta(days=365 * 2)
        entitlement.created = past_datetime
        entitlement.save()

        assert entitlement.is_entitlement_redeemable() is False

    def test_is_entitlement_refundable(self):
        """
        Test that the entitlement is refundable when created now, and is not refundable when created two years
        ago with a policy that sets the expiration period to 60 days
        """
        entitlement = CourseEntitlementFactory.create()
        assert entitlement.is_entitlement_refundable() is True

        # Create a date 2 years in the past (greater than the policy expire period of 60 days)
        past_datetime = datetime.utcnow().replace(tzinfo=pytz.UTC) - timedelta(days=365 * 2)
        entitlement.created = past_datetime
        # Make sure there isn't a course associated
        entitlement.enrollment_course_run = None
        entitlement.save()

        assert entitlement.is_entitlement_refundable() is False

    def test_is_entitlement_regainable(self):
        """
        Test that the entitlement is not expired when created now, and is expired when created two years
        ago with a policy that sets the expiration period to 450 days
        """
        entitlement = CourseEntitlementFactory.create(enrollment_course_run=self.enrollment)
        assert entitlement.is_entitlement_regainable() is True

        # Create a date 2 years in the past (greater than the policy expire period of 14 days)
        # and apply it to both the entitlement and the course
        past_datetime = datetime.utcnow().replace(tzinfo=pytz.UTC) - timedelta(days=365 * 2)
        entitlement.created = past_datetime
        self.enrollment.created = past_datetime
        self.course.start = past_datetime

        entitlement.save()
        self.course.save()
        self.enrollment.save()

        assert entitlement.is_entitlement_regainable() is False

    def test_get_days_until_expiration(self):
        """
        Test that the expiration period is always less than or equal to the policy expiration
        """
        entitlement = CourseEntitlementFactory.create(enrollment_course_run=self.enrollment)
        # This will always either be 1 less than the expiration_period_days because the get_days_until_expiration
        # method will have had at least some time pass between object creation in setUp and this method execution,
        # or the exact same as the original expiration_period_days if somehow no time has passed
        assert entitlement.get_days_until_expiration() <= entitlement.policy.expiration_period_days
