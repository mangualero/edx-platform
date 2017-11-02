"""
Views to show a course outline.
"""
from django.template.context_processors import csrf
from django.template.loader import render_to_string
from opaque_keys.edx.keys import CourseKey
from web_fragments.fragment import Fragment

from courseware.courses import get_course_overview_with_access
from openedx.core.djangoapps.plugin_api.views import EdxFragmentView

from ..utils import get_course_outline_block_tree, get_all_course_blocks
from util.milestones_helpers import get_course_content_milestones


class CourseOutlineFragmentView(EdxFragmentView):
    """
    Course outline fragment to be shown in the unified course view.
    """

    def render_to_fragment(self, request, course_id=None, page_context=None, **kwargs):
        """
        Renders the course outline as a fragment.
        """
        course_key = CourseKey.from_string(course_id)
        course_overview = get_course_overview_with_access(request.user, 'load', course_key, check_if_enrolled=True)
        all_course_blocks = get_all_course_blocks(request, course_id)
        course_block_tree = get_course_outline_block_tree(request, course_id, all_course_blocks)

        if not course_block_tree:
            return None


        content_milestones = self.get_content_milestones(request, course_key, all_course_blocks)

        context = {
            'csrf': csrf(request)['csrf_token'],
            'course': course_overview,
            'blocks': course_block_tree,
            'milestones': content_milestones
        }
        html = render_to_string('course_experience/course-outline-fragment.html', context)
        return Fragment(html)

    def get_content_milestones(self, request, course_key, all_course_blocks):
                
        course_content_milestones = {}

        all_course_prereqs = get_course_content_milestones(
            course_id=course_key,
            content_id=None,
            relationship='requires',
            user_id=None)

        unfulfilled_prereqs = get_course_content_milestones(
            course_id=course_key,
            content_id=None,
            relationship='requires',
            user_id=request.user.id)

        for milestone in all_course_prereqs:
            course_content_milestones[ milestone['content_id'] ] = {
                'completed_prereqs': True,
                'min_score': milestone['requirements']['min_score'],
                'prereq': all_course_blocks['blocks'][milestone['namespace'].replace('.gating', '')]['display_name']
            }
        
        for milestone in unfulfilled_prereqs:
            course_content_milestones[milestone['content_id']]['completed_prereqs'] = False
    
        return course_content_milestones
